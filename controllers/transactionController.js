const pool = require('../config/database');
const { sendWithdrawalNotification } = require('../config/email');
const { isValidWalletAddress, formatBalance } = require('../utils/helpers');

// Get deposit address and info
exports.getDepositInfo = async (req, res) => {
    try {
        const { crypto } = req.params;

        const walletAddresses = {
            'usdt': process.env.WALLET_USDT_TRC20,
            'btc': process.env.WALLET_BTC,
            'eth': process.env.WALLET_ETH
        };

        const address = walletAddresses[crypto.toLowerCase()];

        if (!address) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid cryptocurrency' 
            });
        }

        res.json({
            success: true,
            data: {
                crypto: crypto.toUpperCase(),
                address: address,
                minDeposit: 0  // No minimum deposit required
            }
        });

    } catch (error) {
        console.error('Get deposit info error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Record deposit (admin will confirm manually or via webhook)
exports.createDeposit = async (req, res) => {
    try {
        const { amount, crypto, txHash } = req.body;
        const userId = req.userId;

        // Accept any amount - no minimum deposit requirement
        
        // Create deposit record
        const result = await pool.query(
            `INSERT INTO deposits (user_id, amount, crypto, tx_hash, status) 
             VALUES ($1, $2, $3, $4, 'pending') 
             RETURNING *`,
            [userId, formatBalance(amount), crypto.toUpperCase(), txHash || null]
        );

        res.json({
            success: true,
            message: 'Deposit recorded. Waiting for confirmation.',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Create deposit error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get deposit history
exports.getDepositHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            'SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
            [userId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Get deposit history error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get crypto price in USD
async function getCryptoPriceUSD(crypto) {
    try {
        const coinIds = {
            'ETH': 'ethereum',
            'BTC': 'bitcoin',
            'SOL': 'solana',
            'USDT': 'tether'
        };
        
        const coinId = coinIds[crypto];
        if (!coinId) return 1;
        
        if (crypto === 'USDT') return 1;
        
        const axios = require('axios');
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        const price = response.data[coinId]?.usd;
        
        return price || 1;
    } catch (error) {
        console.error(`Error getting ${crypto} price:`, error.message);
        return 1;
    }
}

// Create withdrawal request
exports.createWithdrawal = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const { amount, crypto, walletAddress } = req.body;
        const userId = req.userId;

        // Validate wallet address
        if (!isValidWalletAddress(walletAddress, crypto)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid wallet address for selected cryptocurrency' 
            });
        }

        // Get user balance
        const userResult = await client.query(
            'SELECT * FROM users WHERE id = $1 FOR UPDATE',
            [userId]
        );

        const user = userResult.rows[0];
        const userBalance = parseFloat(user.balance);
        const withdrawAmountUSD = parseFloat(amount);

        // Validate minimum withdrawal
        if (withdrawAmountUSD < 10) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: 'Minimum withdrawal is 10 USD' 
            });
        }

        // Check balance
        if (withdrawAmountUSD > userBalance) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient balance' 
            });
        }

        // Calculate fees (in USD)
        const networkFeeUSD = parseFloat(process.env.WITHDRAWAL_FEE_USDT || 1);
        const finalAmountUSD = withdrawAmountUSD - networkFeeUSD;

        if (finalAmountUSD <= 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: 'Amount too low after network fee' 
            });
        }

        // Convert USD to selected crypto
        const cryptoPrice = await getCryptoPriceUSD(crypto);
        const cryptoAmount = finalAmountUSD / cryptoPrice;
        
        console.log(`💱 Converting ${finalAmountUSD} USD → ${cryptoAmount.toFixed(8)} ${crypto} @ $${cryptoPrice}`);

        // Deduct from balance (in USD)
        const newBalance = userBalance - withdrawAmountUSD;
        await client.query(
            'UPDATE users SET balance = $1 WHERE id = $2',
            [formatBalance(newBalance), userId]
        );

        // Create withdrawal record (amount in crypto, not USD)
        const result = await client.query(
            `INSERT INTO withdrawals (user_id, amount, crypto, wallet_address, network_fee, final_amount, status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'processing') 
             RETURNING *`,
            [userId, formatBalance(cryptoAmount), crypto.toUpperCase(), walletAddress, 
             formatBalance(networkFeeUSD / cryptoPrice), formatBalance(cryptoAmount)]
        );

        await client.query('COMMIT');

        // Send email notification
        await sendWithdrawalNotification(user.email, withdrawAmountUSD, crypto.toUpperCase(), walletAddress);

        res.json({
            success: true,
            message: `Withdrawal request submitted: ${cryptoAmount.toFixed(8)} ${crypto.toUpperCase()} (≈ $${finalAmountUSD.toFixed(2)} USD)`,
            withdrawalId: result.rows[0].id,
            cryptoAmount: cryptoAmount.toFixed(8),
            cryptoSymbol: crypto.toUpperCase(),
            usdAmount: finalAmountUSD.toFixed(2)
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create withdrawal error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    } finally {
        client.release();
    }
};

// Get withdrawal history
exports.getWithdrawalHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            'SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
            [userId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Get withdrawal history error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

module.exports = exports;


