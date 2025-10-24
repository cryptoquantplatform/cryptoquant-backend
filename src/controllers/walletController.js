const pool = require('../config/database');
const walletService = require('../services/walletService');

const walletController = {
    /**
     * Erstellt Wallets für einen neuen User
     * Wird automatisch bei Registrierung aufgerufen
     */
    async createUserWallets(req, res) {
        const { userId } = req.body;

        try {
            // Generiere alle Wallet-Adressen
            const wallets = walletService.generateAllWallets(userId);

            // Speichere in Datenbank
            for (const wallet of wallets) {
                await pool.query(`
                    INSERT INTO user_wallets (user_id, currency, address, derivation_path)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (address) DO NOTHING
                `, [userId, wallet.currency, wallet.address, wallet.derivationPath]);
            }

            res.json({
                success: true,
                message: 'Wallets created successfully',
                wallets: wallets.map(w => ({
                    currency: w.currency,
                    address: w.address
                }))
            });
        } catch (error) {
            console.error('Error creating wallets:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating wallets',
                error: error.message
            });
        }
    },

    /**
     * Gibt alle Wallets eines Users zurück
     */
    async getUserWallets(req, res) {
        const userId = req.user?.id || req.params.userId;

        try {
            const result = await pool.query(`
                SELECT 
                    id,
                    currency,
                    address,
                    created_at
                FROM user_wallets
                WHERE user_id = $1
                ORDER BY 
                    CASE currency
                        WHEN 'BTC' THEN 1
                        WHEN 'ETH' THEN 2
                        WHEN 'USDT' THEN 3
                        ELSE 4
                    END
            `, [userId]);

            // Falls keine Wallets existieren, erstelle sie
            if (result.rows.length === 0) {
                const wallets = walletService.generateAllWallets(userId);
                
                for (const wallet of wallets) {
                    await pool.query(`
                        INSERT INTO user_wallets (user_id, currency, address, derivation_path)
                        VALUES ($1, $2, $3, $4)
                    `, [userId, wallet.currency, wallet.address, wallet.derivationPath]);
                }

                // Hole neu erstellte Wallets
                const newResult = await pool.query(`
                    SELECT id, currency, address, created_at
                    FROM user_wallets
                    WHERE user_id = $1
                `, [userId]);

                return res.json({
                    success: true,
                    wallets: newResult.rows
                });
            }

            res.json({
                success: true,
                wallets: result.rows
            });
        } catch (error) {
            console.error('Error getting user wallets:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting wallets',
                error: error.message
            });
        }
    },

    /**
     * Gibt Deposit-Adresse für eine spezifische Währung
     */
    async getDepositAddress(req, res) {
        const userId = req.user?.id || req.params.userId;
        const { currency } = req.params; // BTC, ETH, USDT

        try {
            // Prüfe ob Wallet existiert
            let result = await pool.query(`
                SELECT address, created_at
                FROM user_wallets
                WHERE user_id = $1 AND currency = $2
            `, [userId, currency.toUpperCase()]);

            // Falls nicht, erstelle es
            if (result.rows.length === 0) {
                let wallet;
                if (currency.toUpperCase() === 'BTC') {
                    wallet = walletService.generateBTCAddress(userId);
                } else if (currency.toUpperCase() === 'ETH') {
                    wallet = walletService.generateETHAddress(userId);
                } else if (currency.toUpperCase() === 'USDT') {
                    wallet = walletService.generateUSDTAddress(userId);
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Unsupported currency'
                    });
                }

                await pool.query(`
                    INSERT INTO user_wallets (user_id, currency, address, derivation_path)
                    VALUES ($1, $2, $3, $4)
                `, [userId, wallet.currency, wallet.address, wallet.derivationPath]);

                return res.json({
                    success: true,
                    currency: wallet.currency,
                    address: wallet.address,
                    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${wallet.address}`
                });
            }

            res.json({
                success: true,
                currency: currency.toUpperCase(),
                address: result.rows[0].address,
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${result.rows[0].address}`
            });
        } catch (error) {
            console.error('Error getting deposit address:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting deposit address',
                error: error.message
            });
        }
    },

    /**
     * Gibt Wallet-Transaktionen zurück
     */
    async getWalletTransactions(req, res) {
        const userId = req.user?.id || req.params.userId;

        try {
            const result = await pool.query(`
                SELECT 
                    wt.id,
                    wt.tx_hash,
                    wt.amount,
                    wt.confirmations,
                    wt.status,
                    wt.created_at,
                    uw.currency,
                    uw.address
                FROM wallet_transactions wt
                JOIN user_wallets uw ON wt.wallet_id = uw.id
                WHERE uw.user_id = $1
                ORDER BY wt.created_at DESC
                LIMIT 50
            `, [userId]);

            res.json({
                success: true,
                transactions: result.rows
            });
        } catch (error) {
            console.error('Error getting wallet transactions:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting transactions',
                error: error.message
            });
        }
    }
};

module.exports = walletController;




