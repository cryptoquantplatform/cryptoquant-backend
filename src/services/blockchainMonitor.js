const axios = require('axios');
const pool = require('../config/database');

class BlockchainMonitor {
    constructor() {
        this.isMonitoring = false;
        this.checkInterval = 30000; // 30 Sekunden
        
        // API Keys (in .env speichern!)
        this.BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN;
        this.ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
    }

    /**
     * Startet den Blockchain Monitor
     */
    start() {
        if (this.isMonitoring) {
            console.log('⚠️ Monitor läuft bereits');
            return;
        }

        this.isMonitoring = true;
        console.log('🚀 Blockchain Monitor gestartet');
        
        // Initial check
        this.checkAllWallets();
        
        // Wiederhole alle 30 Sekunden
        this.monitorInterval = setInterval(() => {
            this.checkAllWallets();
        }, this.checkInterval);
    }

    /**
     * Stoppt den Monitor
     */
    stop() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.isMonitoring = false;
            console.log('🛑 Blockchain Monitor gestoppt');
        }
    }

    /**
     * Überprüft alle Wallets in der Datenbank
     */
    async checkAllWallets() {
        try {
            console.log('🔍 Checking all wallets...');
            
            // Hole alle Wallets
            const result = await pool.query(`
                SELECT id, user_id, currency, address 
                FROM user_wallets 
                WHERE currency IN ('BTC', 'ETH', 'USDT')
            `);

            for (const wallet of result.rows) {
                if (wallet.currency === 'BTC') {
                    await this.checkBTCWallet(wallet);
                } else if (wallet.currency === 'ETH' || wallet.currency === 'USDT') {
                    await this.checkETHWallet(wallet);
                }
            }
        } catch (error) {
            console.error('❌ Error checking wallets:', error);
        }
    }

    /**
     * Überprüft eine Bitcoin Adresse
     */
    async checkBTCWallet(wallet) {
        try {
            const url = `https://api.blockcypher.com/v1/btc/main/addrs/${wallet.address}/balance`;
            const response = await axios.get(url, {
                params: { token: this.BLOCKCYPHER_TOKEN }
            });

            const balanceBTC = response.data.balance / 100000000; // Satoshi to BTC
            
            if (balanceBTC > 0) {
                console.log(`💰 BTC Deposit detected! User ${wallet.user_id}: ${balanceBTC} BTC`);
                await this.processDeposit(wallet, balanceBTC, response.data);
            }
        } catch (error) {
            console.error(`Error checking BTC wallet ${wallet.address}:`, error.message);
        }
    }

    /**
     * Überprüft eine Ethereum/USDT Adresse
     */
    async checkETHWallet(wallet) {
        try {
            if (wallet.currency === 'ETH') {
                // Check ETH balance
                const url = `https://api.etherscan.io/api`;
                const response = await axios.get(url, {
                    params: {
                        module: 'account',
                        action: 'balance',
                        address: wallet.address,
                        tag: 'latest',
                        apikey: this.ETHERSCAN_API_KEY
                    }
                });

                const balanceETH = parseFloat(response.data.result) / 1e18; // Wei to ETH
                
                if (balanceETH > 0) {
                    console.log(`💰 ETH Deposit detected! User ${wallet.user_id}: ${balanceETH} ETH`);
                    await this.processDeposit(wallet, balanceETH, response.data);
                }
            } else if (wallet.currency === 'USDT') {
                // Check USDT (ERC-20) balance
                const USDT_CONTRACT = '0xdac17f958d2ee523a2206206994597c13d831ec7';
                const url = `https://api.etherscan.io/api`;
                const response = await axios.get(url, {
                    params: {
                        module: 'account',
                        action: 'tokenbalance',
                        contractaddress: USDT_CONTRACT,
                        address: wallet.address,
                        tag: 'latest',
                        apikey: this.ETHERSCAN_API_KEY
                    }
                });

                const balanceUSDT = parseFloat(response.data.result) / 1e6; // USDT has 6 decimals
                
                if (balanceUSDT > 0) {
                    console.log(`💰 USDT Deposit detected! User ${wallet.user_id}: ${balanceUSDT} USDT`);
                    await this.processDeposit(wallet, balanceUSDT, response.data);
                }
            }
        } catch (error) {
            console.error(`Error checking ETH/USDT wallet ${wallet.address}:`, error.message);
        }
    }

    /**
     * Verarbeitet einen erkannten Deposit
     */
    async processDeposit(wallet, amount, txData) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // 1. Prüfe ob Transaktion schon verarbeitet wurde
            const txHash = txData.tx_hash || txData.txhash || 'manual_deposit';
            const existingTx = await client.query(
                'SELECT id FROM wallet_transactions WHERE tx_hash = $1',
                [txHash]
            );

            if (existingTx.rows.length > 0) {
                console.log(`⚠️ Transaction ${txHash} already processed`);
                return;
            }

            // 2. Füge Transaktion hinzu
            await client.query(`
                INSERT INTO wallet_transactions (wallet_id, tx_hash, amount, confirmations, status)
                VALUES ($1, $2, $3, $4, $5)
            `, [wallet.id, txHash, amount, 6, 'confirmed']);

            // 3. Update User Balance
            const euroValue = await this.convertToEuro(wallet.currency, amount);
            await client.query(`
                UPDATE users 
                SET balance = balance + $1 
                WHERE id = $2
            `, [euroValue, wallet.user_id]);

            // 4. Erstelle Deposit-Eintrag
            await client.query(`
                INSERT INTO deposits (user_id, crypto_type, amount, status, wallet_address)
                VALUES ($1, $2, $3, $4, $5)
            `, [wallet.user_id, wallet.currency, amount, 'approved', wallet.address]);

            await client.query('COMMIT');
            console.log(`✅ Deposit processed: ${amount} ${wallet.currency} for user ${wallet.user_id}`);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error processing deposit:', error);
        } finally {
            client.release();
        }
    }

    /**
     * Konvertiert Crypto zu Euro (vereinfacht)
     */
    async convertToEuro(currency, amount) {
        // Hier würdest du eine echte API wie CoinGecko verwenden
        const rates = {
            'BTC': 50000, // €50,000 pro BTC
            'ETH': 3000,  // €3,000 pro ETH
            'USDT': 0.92  // €0.92 pro USDT
        };
        
        return amount * (rates[currency] || 1);
    }
}

module.exports = new BlockchainMonitor();
