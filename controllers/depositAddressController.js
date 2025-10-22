const walletService = require('../services/walletService');
const blockchainMonitor = require('../services/blockchainMonitor');
const pool = require('../config/database');
const QRCode = require('qrcode');

// Get user's deposit addresses
exports.getDepositAddresses = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware

        // Get or generate addresses
        const addresses = await walletService.getUserDepositAddresses(userId);

        // Get balances for each address
        const balances = {
            ETH: await blockchainMonitor.checkEthereumBalance(addresses.ETH),
            USDT: await blockchainMonitor.checkUSDTBalance(addresses.USDT),
            BTC: await blockchainMonitor.checkBitcoinBalance(addresses.BTC),
            SOL: await blockchainMonitor.checkSolanaBalance(addresses.SOL)
        };

        // Get pending transactions
        const pendingTx = await pool.query(
            `SELECT crypto, tx_hash, amount, confirmations, required_confirmations, detected_at
             FROM incoming_transactions
             WHERE user_id = $1 AND credited = FALSE
             ORDER BY detected_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            addresses: addresses,
            balances: balances,
            pendingTransactions: pendingTx.rows
        });

    } catch (error) {
        console.error('Get deposit addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching deposit addresses: ' + error.message
        });
    }
};

// Generate QR code for an address
exports.generateQRCode = async (req, res) => {
    try {
        const { address } = req.params;

        if (!address) {
            return res.status(400).json({
                success: false,
                message: 'Address is required'
            });
        }

        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(address, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        res.json({
            success: true,
            qrCode: qrCodeDataURL
        });

    } catch (error) {
        console.error('Generate QR code error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating QR code: ' + error.message
        });
    }
};

// Manually check for new transactions (user-triggered)
exports.checkTransactions = async (req, res) => {
    try {
        const userId = req.userId;

        // Get user's addresses
        const addresses = await walletService.getUserDepositAddresses(userId);

        // Monitor each address
        await Promise.all([
            blockchainMonitor.monitorAddress(userId, addresses.ETH, 'ETH'),
            blockchainMonitor.monitorAddress(userId, addresses.USDT, 'USDT'),
            blockchainMonitor.monitorAddress(userId, addresses.BTC, 'BTC'),
            blockchainMonitor.monitorAddress(userId, addresses.SOL, 'SOL')
        ]);

        // Get updated pending transactions
        const pendingTx = await pool.query(
            `SELECT crypto, tx_hash, amount, confirmations, required_confirmations, detected_at
             FROM incoming_transactions
             WHERE user_id = $1 AND credited = FALSE
             ORDER BY detected_at DESC`,
            [userId]
        );

        // Get updated balance
        const userBalance = await pool.query(
            'SELECT balance FROM users WHERE id = $1',
            [userId]
        );

        res.json({
            success: true,
            message: 'Transaction check completed',
            pendingTransactions: pendingTx.rows,
            balance: userBalance.rows[0]?.balance || 0
        });

    } catch (error) {
        console.error('Check transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking transactions: ' + error.message
        });
    }
};

// Get deposit history
exports.getDepositHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const history = await pool.query(
            `SELECT 
                d.amount,
                d.crypto,
                d.tx_hash,
                d.status,
                d.created_at,
                d.confirmed_at,
                it.confirmations
             FROM deposits d
             LEFT JOIN incoming_transactions it ON d.tx_hash = it.tx_hash
             WHERE d.user_id = $1
             ORDER BY d.created_at DESC
             LIMIT 50`,
            [userId]
        );

        res.json({
            success: true,
            deposits: history.rows
        });

    } catch (error) {
        console.error('Get deposit history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching deposit history: ' + error.message
        });
    }
};


