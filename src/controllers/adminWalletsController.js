const pool = require('../config/database');
const walletService = require('../services/walletService');
const blockchainMonitor = require('../services/blockchainMonitor');
const cryptoTransferService = require('../services/cryptoTransferService');

// Get summary of all withdrawable funds
exports.getWalletsSummary = async (req, res) => {
    try {
        // Get total withdrawable from approved deposits grouped by crypto
        const cryptoBalances = await pool.query(`
            SELECT 
                crypto,
                SUM(amount) as total_amount,
                COUNT(DISTINCT user_id) as user_count,
                COUNT(*) as deposit_count
            FROM deposits
            WHERE status = 'approved'
            GROUP BY crypto
            ORDER BY total_amount DESC
        `);

        // Get total withdrawable in USDT equivalent (for simplicity, showing total from all cryptos)
        const totalWithdrawable = await pool.query(`
            SELECT SUM(amount) as total
            FROM deposits
            WHERE status = 'approved'
        `);

        // Count users with approved deposits
        const usersWithDeposits = await pool.query(`
            SELECT COUNT(DISTINCT user_id) as count
            FROM deposits
            WHERE status = 'approved'
        `);

        // Count pending deposits
        const pendingDeposits = await pool.query(`
            SELECT COUNT(*) as count
            FROM deposits
            WHERE status = 'pending'
        `);

        // Count approved deposits
        const approvedDeposits = await pool.query(`
            SELECT COUNT(*) as count
            FROM deposits
            WHERE status = 'approved'
        `);

        // Get ALL users with approved deposits (shows users with real money)
        const usersWithDepositsList = await pool.query(`
            SELECT 
                u.id as user_id,
                u.full_name,
                u.email,
                u.balance,
                SUM(d.amount) as total_deposits,
                STRING_AGG(DISTINCT d.crypto, ', ') as cryptos,
                COUNT(d.id) as deposit_count
            FROM users u
            INNER JOIN deposits d ON u.id = d.user_id
            WHERE d.status = 'approved'
            GROUP BY u.id, u.full_name, u.email, u.balance
            ORDER BY total_deposits DESC
        `);

        res.json({
            success: true,
            cryptoBalances: cryptoBalances.rows,
            totalWithdrawable: totalWithdrawable.rows[0].total || 0,
            usersWithDepositsCount: usersWithDeposits.rows[0].count || 0,
            pendingDeposits: pendingDeposits.rows[0].count || 0,
            approvedDeposits: approvedDeposits.rows[0].count || 0,
            usersWithDepositsList: usersWithDepositsList.rows
        });

    } catch (error) {
        console.error('Get wallets summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wallet summary'
        });
    }
};

// Get user-specific deposit details
exports.getUserDeposits = async (req, res) => {
    const { userId } = req.params;

    try {
        // Get user info
        const userResult = await pool.query(`
            SELECT id, full_name, email, balance
            FROM users
            WHERE id = $1
        `, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's approved deposits
        const deposits = await pool.query(`
            SELECT 
                id,
                amount,
                crypto,
                wallet_address,
                tx_hash,
                created_at,
                confirmed_at
            FROM deposits
            WHERE user_id = $1 AND status = 'approved'
            ORDER BY confirmed_at DESC
        `, [userId]);

        // Get total deposits
        const totalDeposits = await pool.query(`
            SELECT SUM(amount) as total
            FROM deposits
            WHERE user_id = $1 AND status = 'approved'
        `, [userId]);

        res.json({
            success: true,
            user: userResult.rows[0],
            deposits: deposits.rows,
            total_deposits: totalDeposits.rows[0].total || 0
        });

    } catch (error) {
        console.error('Get user deposits error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user deposits'
        });
    }
};

// Process admin withdrawal
exports.processWithdrawal = async (req, res) => {
    const { userId, crypto, amount, walletAddress, reason } = req.body;
    const adminId = req.adminId; // From middleware

    if (!userId || !crypto || !amount || !walletAddress) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    if (amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Amount must be greater than 0'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get user's current balance
        const userResult = await client.query(`
            SELECT balance FROM users WHERE id = $1
        `, [userId]);

        if (userResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentBalance = parseFloat(userResult.rows[0].balance);

        // Check if user has enough balance
        if (currentBalance < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. User has ${currentBalance.toFixed(2)}, withdrawal requested: ${amount}`
            });
        }

        // Verify user has approved deposits in this crypto
        const depositCheck = await client.query(`
            SELECT SUM(amount) as total
            FROM deposits
            WHERE user_id = $1 AND crypto = $2 AND status = 'approved'
        `, [userId, crypto]);

        const totalDepositsInCrypto = parseFloat(depositCheck.rows[0].total || 0);

        if (totalDepositsInCrypto < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `User only has ${totalDepositsInCrypto.toFixed(8)} ${crypto} in approved deposits`
            });
        }

        // Deduct from user balance
        await client.query(`
            UPDATE users
            SET balance = balance - $1
            WHERE id = $2
        `, [amount, userId]);

        // Create admin withdrawal record
        const withdrawalResult = await client.query(`
            INSERT INTO admin_withdrawals 
            (user_id, admin_id, amount, crypto, admin_wallet_address, reason, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'completed')
            RETURNING id
        `, [userId, adminId, amount, crypto, walletAddress, reason]);

        const transactionId = withdrawalResult.rows[0].id;

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Withdrawal processed successfully',
            transactionId: transactionId,
            amount: amount,
            crypto: crypto,
            walletAddress: walletAddress
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Process withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing withdrawal: ' + error.message
        });
    } finally {
        client.release();
    }
};

// Get admin withdrawal history
exports.getWithdrawalHistory = async (req, res) => {
    try {
        const history = await pool.query(`
            SELECT 
                aw.id,
                aw.amount,
                aw.crypto,
                aw.admin_wallet_address,
                aw.reason,
                aw.created_at,
                u.full_name as user_name,
                u.email as user_email
            FROM admin_withdrawals aw
            INNER JOIN users u ON aw.user_id = u.id
            ORDER BY aw.created_at DESC
            LIMIT 100
        `);

        res.json({
            success: true,
            withdrawals: history.rows
        });

    } catch (error) {
        console.error('Get withdrawal history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching withdrawal history'
        });
    }
};

// Get user wallet balances (on-chain balances)
exports.getUserWalletBalances = async (req, res) => {
    const { userId } = req.params;

    try {
        // Get user deposit addresses
        const addresses = await walletService.getUserDepositAddresses(userId);

        // Helper function to check balance with timeout
        const checkBalanceWithTimeout = async (crypto, address, timeoutMs = 8000) => {
            return Promise.race([
                (async () => {
                    try {
                        let balance = '0';
                        if (crypto === 'ETH') {
                            balance = await blockchainMonitor.checkEthereumBalance(address);
                        } else if (crypto === 'USDT') {
                            balance = await blockchainMonitor.checkUSDTBalance(address);
                        } else if (crypto === 'BTC') {
                            balance = await blockchainMonitor.checkBitcoinBalance(address);
                        } else if (crypto === 'SOL') {
                            balance = await blockchainMonitor.checkSolanaBalance(address);
                        }
                        return { crypto, address, balance, error: null };
                    } catch (error) {
                        console.error(`Error checking ${crypto} balance:`, error.message);
                        return { crypto, address, balance: '0', error: error.message };
                    }
                })(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
                )
            ]).catch(error => {
                console.error(`Timeout checking ${crypto} balance`);
                return { crypto, address, balance: '0', error: 'Timeout' };
            });
        };

        // Check all balances in parallel with timeout
        const balancePromises = Object.entries(addresses).map(([crypto, address]) => 
            checkBalanceWithTimeout(crypto, address)
        );

        const balanceResults = await Promise.all(balancePromises);

        // Build balances object (only include non-zero balances)
        const balances = {};
        balanceResults.forEach(result => {
            if (result && parseFloat(result.balance) > 0) {
                balances[result.crypto] = {
                    address: result.address,
                    balance: result.balance
                };
            }
        });

        // Get user info
        const userResult = await pool.query(
            'SELECT id, full_name, email FROM users WHERE id = $1',
            [userId]
        );

        res.json({
            success: true,
            user: userResult.rows[0],
            walletBalances: balances,
            addresses: addresses
        });

    } catch (error) {
        console.error('Get user wallet balances error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wallet balances'
        });
    }
};

// Cashout user wallet to admin address
exports.cashoutUserWallet = async (req, res) => {
    const { userId, crypto, adminWalletAddress } = req.body;
    const adminId = req.adminId;

    if (!userId || !crypto || !adminWalletAddress) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    try {
        // Get user deposit address for this crypto
        const addresses = await walletService.getUserDepositAddresses(userId);
        const userAddress = addresses[crypto];

        if (!userAddress) {
            return res.status(404).json({
                success: false,
                message: `User does not have a ${crypto} address`
            });
        }

        // Check balance
        let balance = '0';
        if (crypto === 'ETH') {
            balance = await blockchainMonitor.checkEthereumBalance(userAddress);
        } else if (crypto === 'USDT') {
            balance = await blockchainMonitor.checkUSDTBalance(userAddress);
        } else if (crypto === 'BTC') {
            balance = await blockchainMonitor.checkBitcoinBalance(userAddress);
        } else if (crypto === 'SOL') {
            balance = await blockchainMonitor.checkSolanaBalance(userAddress);
        }

        if (parseFloat(balance) <= 0) {
            return res.status(400).json({
                success: false,
                message: `No ${crypto} balance in user wallet`
            });
        }

        // Transfer crypto from user wallet to admin wallet
        const transferResult = await cryptoTransferService.transferCrypto(
            userId,
            crypto,
            userAddress,
            adminWalletAddress,
            balance
        );

        if (!transferResult.success) {
            return res.status(500).json({
                success: false,
                message: transferResult.message
            });
        }

        // Log the cashout
        await pool.query(`
            INSERT INTO admin_cashouts 
            (admin_id, user_id, crypto, amount, from_address, to_address, tx_hash, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')
        `, [adminId, userId, crypto, balance, userAddress, adminWalletAddress, transferResult.txHash]);

        res.json({
            success: true,
            message: `Successfully transferred ${balance} ${crypto}`,
            txHash: transferResult.txHash,
            amount: balance,
            crypto: crypto
        });

    } catch (error) {
        console.error('Cashout user wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing cashout: ' + error.message
        });
    }
};


