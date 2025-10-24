const express = require('express');
const crypto = require('crypto');
const pool = require('../config/database');

class WebhookMonitor {
    constructor() {
        this.webhookSecret = process.env.WEBHOOK_SECRET || 'your_secret_key_123';
    }

    /**
     * Setup Webhook Endpoints
     * KEINE 429 ERRORS! Blockchain ruft uns an statt wir sie!
     */
    setupWebhooks(app) {
        // BlockCypher Webhook für BTC
        app.post('/webhook/blockcypher', this.handleBlockCypherWebhook.bind(this));
        
        // Alchemy Webhook für ETH/USDT
        app.post('/webhook/alchemy', this.handleAlchemyWebhook.bind(this));
        
        console.log('✅ Webhooks configured');
    }

    /**
     * BlockCypher Webhook Handler
     * Wird aufgerufen wenn BTC Transaction erkannt wird
     */
    async handleBlockCypherWebhook(req, res) {
        try {
            const { event, address, value, transaction } = req.body;
            
            console.log('🔔 BlockCypher Webhook:', event, address, value);

            if (event === 'unconfirmed-tx' || event === 'confirmed-tx') {
                // Finde Wallet
                const walletResult = await pool.query(
                    'SELECT id, user_id FROM user_wallets WHERE address = $1 AND currency = $2',
                    [address, 'BTC']
                );

                if (walletResult.rows.length === 0) {
                    console.log('⚠️ Unknown address:', address);
                    return res.json({ success: true, message: 'Unknown address' });
                }

                const wallet = walletResult.rows[0];
                const amountBTC = value / 100000000; // Satoshi to BTC

                // Verarbeite Deposit
                await this.processDeposit({
                    wallet_id: wallet.id,
                    user_id: wallet.user_id,
                    currency: 'BTC',
                    amount: amountBTC,
                    tx_hash: transaction.hash,
                    confirmations: event === 'confirmed-tx' ? 6 : 0
                });

                res.json({ success: true });
            } else {
                res.json({ success: true, message: 'Event ignored' });
            }
        } catch (error) {
            console.error('Error handling BlockCypher webhook:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Alchemy Webhook Handler
     * Wird aufgerufen wenn ETH/USDT Transaction erkannt wird
     */
    async handleAlchemyWebhook(req, res) {
        try {
            const { event, activity } = req.body;
            
            console.log('🔔 Alchemy Webhook:', event);

            if (event.activity && event.activity.length > 0) {
                for (const tx of event.activity) {
                    const toAddress = tx.toAddress;
                    const value = parseFloat(tx.value);
                    
                    // Finde Wallet (ETH oder USDT)
                    const walletResult = await pool.query(
                        'SELECT id, user_id, currency FROM user_wallets WHERE address = $1 AND currency IN ($2, $3)',
                        [toAddress, 'ETH', 'USDT']
                    );

                    if (walletResult.rows.length > 0) {
                        const wallet = walletResult.rows[0];
                        
                        await this.processDeposit({
                            wallet_id: wallet.id,
                            user_id: wallet.user_id,
                            currency: wallet.currency,
                            amount: value,
                            tx_hash: tx.hash,
                            confirmations: 12
                        });
                    }
                }
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error handling Alchemy webhook:', error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Verarbeitet einen Deposit
     */
    async processDeposit(data) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Prüfe ob bereits verarbeitet
            const existingTx = await client.query(
                'SELECT id FROM wallet_transactions WHERE tx_hash = $1',
                [data.tx_hash]
            );

            if (existingTx.rows.length > 0) {
                console.log('⚠️ Transaction already processed:', data.tx_hash);
                await client.query('ROLLBACK');
                return;
            }

            // Füge Transaction hinzu
            await client.query(`
                INSERT INTO wallet_transactions (wallet_id, tx_hash, amount, confirmations, status)
                VALUES ($1, $2, $3, $4, $5)
            `, [data.wallet_id, data.tx_hash, data.amount, data.confirmations, 'confirmed']);

            // Konvertiere zu Euro
            const euroValue = await this.convertToEuro(data.currency, data.amount);

            // Update User Balance
            await client.query(`
                UPDATE users 
                SET balance = balance + $1 
                WHERE id = $2
            `, [euroValue, data.user_id]);

            // Erstelle Deposit Record
            await client.query(`
                INSERT INTO deposits (user_id, crypto_type, amount, status, wallet_address)
                VALUES ($1, $2, $3, $4, $5)
            `, [data.user_id, data.currency, data.amount, 'approved', 'webhook_deposit']);

            await client.query('COMMIT');
            
            console.log(`✅ Deposit processed via webhook: ${data.amount} ${data.currency} for user ${data.user_id}`);
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error processing deposit:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Konvertiert Crypto zu Euro
     */
    async convertToEuro(currency, amount) {
        // Vereinfachte Conversion - in Production echte API verwenden
        const rates = {
            'BTC': 50000,
            'ETH': 3000,
            'USDT': 0.92
        };
        
        return amount * (rates[currency] || 1);
    }

    /**
     * Setup Webhooks auf BlockCypher
     * Muss nur 1x ausgeführt werden!
     */
    async registerBlockCypherWebhook(address) {
        const axios = require('axios');
        
        const webhookUrl = `${process.env.APP_URL}/webhook/blockcypher`;
        const token = process.env.BLOCKCYPHER_TOKEN;
        
        try {
            const response = await axios.post(
                `https://api.blockcypher.com/v1/btc/main/hooks?token=${token}`,
                {
                    event: 'unconfirmed-tx',
                    address: address,
                    url: webhookUrl
                }
            );
            
            console.log('✅ BlockCypher webhook registered for:', address);
            return response.data;
        } catch (error) {
            console.error('Error registering webhook:', error.message);
        }
    }

    /**
     * Setup Webhook auf Alchemy
     */
    async registerAlchemyWebhook(addresses) {
        const axios = require('axios');
        
        const alchemyApiKey = process.env.ALCHEMY_API_KEY;
        const webhookUrl = `${process.env.APP_URL}/webhook/alchemy`;
        
        try {
            const response = await axios.post(
                `https://dashboard.alchemy.com/api/create-webhook`,
                {
                    webhook_type: 'ADDRESS_ACTIVITY',
                    webhook_url: webhookUrl,
                    addresses: addresses,
                    network: 'ETH_MAINNET'
                },
                {
                    headers: {
                        'X-Alchemy-Token': alchemyApiKey
                    }
                }
            );
            
            console.log('✅ Alchemy webhook registered');
            return response.data;
        } catch (error) {
            console.error('Error registering Alchemy webhook:', error.message);
        }
    }
}

module.exports = new WebhookMonitor();




