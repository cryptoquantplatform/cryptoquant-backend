const axios = require('axios');
const { ethers } = require('ethers');
const pool = require('../config/database');
const { HttpsProxyAgent } = require('https-proxy-agent');
const freeProxyManager = require('./freeProxyManager');

// API Keys (should be in .env in production)
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'YourEtherscanAPIKey';
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN || ''; // For Bitcoin

// Ethereum provider (using public RPC for testing)
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://eth.llamarpc.com';
const ethProvider = new ethers.JsonRpcProvider(ETH_RPC_URL);

// ==========================================
// PROXY ROTATION SYSTEM
// ==========================================
// Load proxies from environment variable
// Format: PROXY_LIST=http://user:pass@host1:port,http://user:pass@host2:port
const PROXY_LIST = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',').map(p => p.trim()) : [];
let currentProxyIndex = 0;

// Check if we should use free proxies
const USE_FREE_PROXIES = process.env.USE_FREE_PROXIES === 'true' || PROXY_LIST.length === 0;

if (USE_FREE_PROXIES && PROXY_LIST.length === 0) {
    console.log('🆓 Free proxy mode enabled - will automatically fetch and rotate free proxies');
} else if (PROXY_LIST.length > 0) {
    console.log(`🔐 Using ${PROXY_LIST.length} configured proxies from PROXY_LIST`);
} else {
    console.log('⚠️ No proxies configured - using direct connection (may hit rate limits)');
}

// Get next proxy in rotation (paid proxies)
function getNextProxy() {
    if (PROXY_LIST.length === 0) {
        return null; // No proxies configured
    }
    const proxy = PROXY_LIST[currentProxyIndex];
    currentProxyIndex = (currentProxyIndex + 1) % PROXY_LIST.length;
    console.log(`🔄 Using proxy ${currentProxyIndex}/${PROXY_LIST.length}: ${proxy.replace(/\/\/.*:.*@/, '//***:***@')}`); // Hide credentials in log
    return proxy;
}

// Create axios config with proxy
function getAxiosConfig(timeout = 10000) {
    const config = { timeout };
    
    // Try paid proxies first
    if (PROXY_LIST.length > 0) {
        const proxy = getNextProxy();
        if (proxy) {
            config.httpsAgent = new HttpsProxyAgent(proxy);
            config.httpAgent = new HttpsProxyAgent(proxy);
        }
        return config;
    }
    
    // Use free proxies if enabled
    if (USE_FREE_PROXIES) {
        return freeProxyManager.getAxiosConfig(timeout);
    }
    
    // No proxies at all
    return config;
}

// USDT Contract address (Ethereum mainnet)
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

// Minimum confirmations required
const REQUIRED_CONFIRMATIONS = {
    ETH: 12,
    BTC: 3,
    USDT: 12,
    SOL: 1
};

// Check Ethereum balance for an address
async function checkEthereumBalance(address) {
    try {
        const balance = await ethProvider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (error) {
        console.error(`Error checking ETH balance for ${address}:`, error.message);
        return '0';
    }
}

// Check USDT (ERC-20) balance
async function checkUSDTBalance(address) {
    try {
        // USDT Contract ABI (minimal)
        const usdtAbi = ['function balanceOf(address) view returns (uint256)'];
        const usdtContract = new ethers.Contract(USDT_CONTRACT, usdtAbi, ethProvider);
        const balance = await usdtContract.balanceOf(address);
        // USDT has 6 decimals
        return (Number(balance) / 1000000).toString();
    } catch (error) {
        console.error(`Error checking USDT balance for ${address}:`, error.message);
        return '0';
    }
}

// Check Bitcoin balance using BlockCypher API
async function checkBitcoinBalance(address) {
    try {
        const url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`;
        const response = await axios.get(url, getAxiosConfig(10000));
        const balanceSatoshis = response.data.balance || 0;
        return (balanceSatoshis / 100000000).toString(); // Convert satoshis to BTC
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error(`Error checking BTC balance for ${address}: Rate limit exceeded (429)`);
            throw new Error('Request failed with status code 429');
        }
        console.error(`Error checking BTC balance for ${address}:`, error.message);
        return '0';
    }
}

// Check Solana balance
async function checkSolanaBalance(address) {
    try {
        // Using public Solana RPC endpoint with proxy
        const response = await axios.post('https://api.mainnet-beta.solana.com', {
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [address]
        }, getAxiosConfig(10000));
        
        if (response.data && response.data.result && response.data.result.value !== undefined) {
            const lamports = response.data.result.value;
            return (lamports / 1000000000).toString(); // Convert lamports to SOL
        }
        return '0';
    } catch (error) {
        console.error(`Error checking SOL balance for ${address}:`, error.message);
        return '0';
    }
}

// Get Ethereum transactions for an address
async function getEthereumTransactions(address) {
    try {
        // Using Etherscan API with proxy
        const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
        const response = await axios.get(url, getAxiosConfig(10000));
        
        if (response.data.status === '1' && response.data.result) {
            return response.data.result;
        }
        return [];
    } catch (error) {
        console.error(`Error getting ETH transactions for ${address}:`, error.message);
        return [];
    }
}

// Get USDT (ERC-20) transactions
async function getUSDTTransactions(address) {
    try {
        // Using Etherscan API for ERC-20 token transfers with proxy
        const url = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${USDT_CONTRACT}&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
        const response = await axios.get(url, getAxiosConfig(10000));
        
        if (response.data.status === '1' && response.data.result) {
            return response.data.result;
        }
        return [];
    } catch (error) {
        console.error(`Error getting USDT transactions for ${address}:`, error.message);
        return [];
    }
}

// Get Bitcoin transactions with rate limit handling
async function getBitcoinTransactions(address) {
    try {
        const url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}/full`;
        const response = await axios.get(url, getAxiosConfig(10000));
        return response.data.txs || [];
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error(`Error getting BTC transactions for ${address}: Rate limit exceeded (429)`);
            throw new Error('Request failed with status code 429');
        }
        console.error(`Error getting BTC transactions for ${address}:`, error.message);
        return [];
    }
}

// Get Solana transactions with rate limit handling
async function getSolanaTransactions(address) {
    try {
        // Using Solana RPC to get signatures (transactions) for address with proxy
        const response = await axios.post('https://api.mainnet-beta.solana.com', {
            jsonrpc: '2.0',
            id: 1,
            method: 'getSignaturesForAddress',
            params: [
                address,
                { limit: 10 }
            ]
        }, getAxiosConfig(10000));
        
        if (response.data && response.data.result) {
            return response.data.result;
        }
        return [];
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error(`Error getting SOL transactions for ${address}: Rate limit exceeded (429)`);
            throw new Error('Request failed with status code 429');
        }
        console.error(`Error getting SOL transactions for ${address}:`, error.message);
        return [];
    }
}

// Process incoming transaction
async function processIncomingTransaction(userId, address, crypto, txHash, amount, confirmations) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Check if transaction already exists
        const existing = await client.query(
            'SELECT id, credited FROM incoming_transactions WHERE tx_hash = $1',
            [txHash]
        );

        if (existing.rows.length > 0) {
            const transaction = existing.rows[0];
            
            // Update confirmations
            await client.query(
                'UPDATE incoming_transactions SET confirmations = $1, status = $2 WHERE id = $3',
                [
                    confirmations,
                    confirmations >= REQUIRED_CONFIRMATIONS[crypto] ? 'confirmed' : 'pending',
                    transaction.id
                ]
            );

            // If enough confirmations and not yet credited
            if (confirmations >= REQUIRED_CONFIRMATIONS[crypto] && !transaction.credited) {
                await creditUserBalance(client, userId, amount, crypto, txHash);
                
                // Send "Payment Completed" notification
                await client.query(
                    `INSERT INTO notifications (user_id, type, title, message)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        userId,
                        'deposit_confirmed',
                        '✅ Payment Completed',
                        `Your ${amount} ${crypto} deposit has been confirmed and added to your balance!`
                    ]
                );
            }
        } else {
            // New transaction
            await client.query(
                `INSERT INTO incoming_transactions 
                (user_id, deposit_address, crypto, tx_hash, amount, confirmations, required_confirmations, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    userId,
                    address,
                    crypto,
                    txHash,
                    amount,
                    confirmations,
                    REQUIRED_CONFIRMATIONS[crypto],
                    confirmations >= REQUIRED_CONFIRMATIONS[crypto] ? 'confirmed' : 'pending'
                ]
            );

            // Send "Payment Pending" notification for new deposits
            await client.query(
                `INSERT INTO notifications (user_id, type, title, message)
                 VALUES ($1, $2, $3, $4)`,
                [
                    userId,
                    'deposit_pending',
                    '⏳ Payment is Pending',
                    `We received your ${amount} ${crypto} deposit! Waiting for blockchain confirmations...`
                ]
            );

            // If enough confirmations, credit immediately
            if (confirmations >= REQUIRED_CONFIRMATIONS[crypto]) {
                await creditUserBalance(client, userId, amount, crypto, txHash);
                
                // Send "Payment Completed" notification
                await client.query(
                    `INSERT INTO notifications (user_id, type, title, message)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        userId,
                        'deposit_confirmed',
                        '✅ Payment Completed',
                        `Your ${amount} ${crypto} deposit has been confirmed and added to your balance!`
                    ]
                );
            }
        }

        await client.query('COMMIT');
        console.log(`✅ Processed transaction ${txHash} for user ${userId}: ${amount} ${crypto}`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing incoming transaction:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Get crypto price in USD (with fallback prices and retry logic)
async function getCryptoPriceUSD(crypto) {
    // Realistic fallback prices (updated 2025)
    const FALLBACK_PRICES = {
        'ETH': 2500,
        'BTC': 65000,
        'SOL': 140,
        'USDT': 1
    };
    
    try {
        // USDT is always $1
        if (crypto === 'USDT') {
            return 1;
        }
        
        const coinIds = {
            'ETH': 'ethereum',
            'BTC': 'bitcoin',
            'SOL': 'solana',
            'USDT': 'tether'
        };
        
        const coinId = coinIds[crypto];
        if (!coinId) {
            console.error(`Unknown crypto: ${crypto}`);
            return FALLBACK_PRICES[crypto] || 1;
        }
        
        // Try CoinGecko first
        try {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
                { timeout: 5000 }
            );
            const price = response.data[coinId]?.usd;
            
            if (price && price > 0) {
                console.log(`💵 ${crypto} price: $${price} (CoinGecko)`);
                return price;
            }
        } catch (coinGeckoError) {
            console.warn(`⚠️ CoinGecko API failed: ${coinGeckoError.message}`);
        }
        
        // Fallback to CoinCap API
        try {
            const coinCapIds = {
                'ETH': 'ethereum',
                'BTC': 'bitcoin',
                'SOL': 'solana'
            };
            
            const response = await axios.get(
                `https://api.coincap.io/v2/assets/${coinCapIds[crypto]}`,
                { timeout: 5000 }
            );
            const price = parseFloat(response.data?.data?.priceUsd);
            
            if (price && price > 0) {
                console.log(`💵 ${crypto} price: $${price} (CoinCap)`);
                return price;
            }
        } catch (coinCapError) {
            console.warn(`⚠️ CoinCap API failed: ${coinCapError.message}`);
        }
        
        // Use realistic fallback price
        console.warn(`⚠️ Using fallback price for ${crypto}: $${FALLBACK_PRICES[crypto]}`);
        return FALLBACK_PRICES[crypto] || 1;
        
    } catch (error) {
        console.error(`Error getting ${crypto} price:`, error.message);
        return FALLBACK_PRICES[crypto] || 1;
    }
}

// Credit user balance
async function creditUserBalance(client, userId, amount, crypto, txHash) {
    try {
        // Convert crypto amount to USD
        const priceUSD = await getCryptoPriceUSD(crypto);
        const usdValue = parseFloat(amount) * priceUSD;
        
        console.log(`💰 Converting ${amount} ${crypto} × $${priceUSD} = $${usdValue.toFixed(4)} USD`);
        
        // Accept any amount, no minimum limit
        const creditAmount = usdValue;
        
        console.log(`✅ Crediting $${creditAmount.toFixed(4)} USD to user ${userId}`);
        
        // Update user balance with USD value
        await client.query(
            'UPDATE users SET balance = balance + $1 WHERE id = $2',
            [creditAmount, userId]
        );

        // Mark transaction as credited
        await client.query(
            'UPDATE incoming_transactions SET credited = TRUE, credited_at = NOW(), confirmed_at = NOW() WHERE tx_hash = $1',
            [txHash]
        );

        // Create deposit record (store original crypto amount)
        await client.query(
            `INSERT INTO deposits (user_id, amount, crypto, tx_hash, status, confirmed_at)
             VALUES ($1, $2, $3, $4, 'approved', NOW())`,
            [userId, amount, crypto, txHash]
        );

        console.log(`💰 Credited ${amount} ${crypto} ($${usdValue.toFixed(2)} USD) to user ${userId} from TX ${txHash}`);

        // Distribute deposit bonus to upline (small percentage)
        await distributeDepositBonus(client, userId, usdValue);

    } catch (error) {
        console.error('Error crediting user balance:', error);
        throw error;
    }
}

// Distribute deposit bonus to upline (when someone in downline deposits)
async function distributeDepositBonus(client, depositorUserId, depositAmount) {
    try {
        // Get upline users
        const upline = await getUplineUsers(depositorUserId);
        
        if (upline.length === 0) return;
        
        // Deposit bonus rates (smaller than quantification commissions)
        const DEPOSIT_BONUS_RATES = {
            1: 0.01,   // 1% for direct referrer
            2: 0.003,  // 0.3% for level 2
            3: 0.001   // 0.1% for level 3+
        };
        
        for (const uplineUser of upline) {
            let bonusRate;
            if (uplineUser.pyramid_level === 1) {
                bonusRate = DEPOSIT_BONUS_RATES[1];
            } else if (uplineUser.pyramid_level === 2) {
                bonusRate = DEPOSIT_BONUS_RATES[2];
            } else {
                bonusRate = DEPOSIT_BONUS_RATES[3];
            }
            
            const bonus = depositAmount * bonusRate;
            
            // Credit any bonus amount, no minimum
            if (bonus > 0) {
                await client.query(
                    'UPDATE users SET balance = balance + $1 WHERE id = $2',
                    [bonus, uplineUser.user_id]
                );
                
                console.log(`🎁 Deposit Bonus: $${bonus.toFixed(4)} USD (${(bonusRate * 100).toFixed(1)}%) to User ${uplineUser.user_id} [Level ${uplineUser.pyramid_level}]`);
            }
        }
        
    } catch (error) {
        console.error('Error distributing deposit bonus:', error);
        // Don't throw - bonus distribution shouldn't block the deposit
    }
}

// Get upline users for deposit bonus
async function getUplineUsers(userId, maxLevels = 10) {
    const upline = [];
    let currentUserId = userId;
    let level = 1;
    
    while (level <= maxLevels) {
        const referrer = await pool.query(
            `SELECT r.referrer_id, u.full_name 
             FROM referrals r
             JOIN users u ON r.referrer_id = u.id
             WHERE r.referred_id = $1`,
            [currentUserId]
        );
        
        if (referrer.rows.length === 0) break;
        
        upline.push({
            user_id: referrer.rows[0].referrer_id,
            user_name: referrer.rows[0].full_name,
            pyramid_level: level
        });
        
        currentUserId = referrer.rows[0].referrer_id;
        level++;
    }
    
    return upline;
}

// Monitor a single address with retry logic
async function monitorAddress(userId, address, crypto) {
    try {
        // Check if we should skip this check due to recent rate limit errors
        if (global.rateLimitBackoff && global.rateLimitBackoff[crypto]) {
            const backoffUntil = global.rateLimitBackoff[crypto];
            if (Date.now() < backoffUntil) {
                console.log(`⏸️ Skipping ${crypto} checks (rate limit backoff until ${new Date(backoffUntil).toLocaleTimeString()})`);
                return;
            }
        }
        let transactions = [];

        // Get transactions based on crypto type
        if (crypto === 'ETH') {
            transactions = await getEthereumTransactions(address);
            
            // Process only incoming transactions
            for (const tx of transactions.slice(0, 10)) { // Check last 10 transactions
                if (tx.to.toLowerCase() === address.toLowerCase() && tx.value !== '0') {
                    const amount = ethers.formatEther(tx.value);
                    const currentBlock = await ethProvider.getBlockNumber();
                    const confirmations = currentBlock - parseInt(tx.blockNumber);
                    
                    if (parseFloat(amount) > 0) {
                        await processIncomingTransaction(
                            userId,
                            address,
                            crypto,
                            tx.hash,
                            amount,
                            confirmations
                        );
                    }
                }
            }
        } else if (crypto === 'USDT') {
            transactions = await getUSDTTransactions(address);
            
            for (const tx of transactions.slice(0, 10)) {
                if (tx.to.toLowerCase() === address.toLowerCase() && tx.value !== '0') {
                    const amount = (parseInt(tx.value) / 1000000).toString(); // USDT has 6 decimals
                    const currentBlock = await ethProvider.getBlockNumber();
                    const confirmations = currentBlock - parseInt(tx.blockNumber);
                    
                    if (parseFloat(amount) > 0) {
                        await processIncomingTransaction(
                            userId,
                            address,
                            crypto,
                            tx.hash,
                            amount,
                            confirmations
                        );
                    }
                }
            }
        } else if (crypto === 'BTC') {
            transactions = await getBitcoinTransactions(address);
            
            for (const tx of transactions.slice(0, 10)) {
                // Find outputs to our address
                if (tx.outputs) {
                    for (const output of tx.outputs) {
                        if (output.addresses && output.addresses.includes(address)) {
                            const amount = (output.value / 100000000).toString(); // Satoshis to BTC
                            const confirmations = tx.confirmations || 0;
                            
                            if (parseFloat(amount) > 0) {
                                await processIncomingTransaction(
                                    userId,
                                    address,
                                    crypto,
                                    tx.hash,
                                    amount,
                                    confirmations
                                );
                            }
                        }
                    }
                }
            }
        } else if (crypto === 'SOL') {
            transactions = await getSolanaTransactions(address);
            
            for (const tx of transactions.slice(0, 10)) {
                // Get transaction details to find amount
                try {
                    const txResponse = await axios.post('https://api.mainnet-beta.solana.com', {
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getTransaction',
                        params: [
                            tx.signature,
                            { encoding: 'jsonParsed' }
                        ]
                    });
                    
                    if (txResponse.data && txResponse.data.result) {
                        const txData = txResponse.data.result;
                        const meta = txData.meta;
                        
                        // Check if transaction was successful
                        if (meta && meta.err === null) {
                            // Get post and pre balances to calculate amount received
                            const accountKeys = txData.transaction.message.accountKeys;
                            const addressIndex = accountKeys.findIndex(key => 
                                (typeof key === 'string' ? key : key.pubkey) === address
                            );
                            
                            if (addressIndex !== -1 && meta.postBalances && meta.preBalances) {
                                const preBalance = meta.preBalances[addressIndex] || 0;
                                const postBalance = meta.postBalances[addressIndex] || 0;
                                const difference = postBalance - preBalance;
                                
                                if (difference > 0) {
                                    const amount = (difference / 1000000000).toString(); // Lamports to SOL
                                    const confirmations = tx.confirmationStatus === 'finalized' ? 32 : 1;
                                    
                                    if (parseFloat(amount) > 0) {
                                        await processIncomingTransaction(
                                            userId,
                                            address,
                                            crypto,
                                            tx.signature,
                                            amount,
                                            confirmations
                                        );
                                    }
                                }
                            }
                        }
                    }
                } catch (txError) {
                    console.error(`Error processing SOL transaction ${tx.signature}:`, txError.message);
                }
            }
        }

        // Update last checked timestamp
        await pool.query(
            'UPDATE user_deposit_addresses SET last_checked = NOW() WHERE user_id = $1 AND crypto = $2',
            [userId, crypto]
        );

    } catch (error) {
        console.error(`Error monitoring address ${address} (${crypto}):`, error.message);
        
        // If rate limit error (429), set backoff for this crypto type
        if (error.message && error.message.includes('429')) {
            if (!global.rateLimitBackoff) {
                global.rateLimitBackoff = {};
            }
            // Backoff for 5 minutes (increased from 2 minutes)
            global.rateLimitBackoff[crypto] = Date.now() + (5 * 60 * 1000);
            console.log(`⏸️ Rate limit hit for ${crypto}. Backing off for 5 minutes.`);
        }
    }
}

// Monitor all user addresses with better rate limiting
async function monitorAllAddresses() {
    try {
        const result = await pool.query(
            `SELECT user_id, address, crypto 
             FROM user_deposit_addresses 
             WHERE last_checked IS NULL OR last_checked < NOW() - INTERVAL '5 minutes'
             ORDER BY last_checked ASC NULLS FIRST
             LIMIT 20`  // Reduced from 50 to avoid rate limits
        );

        console.log(`🔍 Monitoring ${result.rows.length} addresses...`);

        // Group addresses by crypto type to optimize API calls
        const addressesByCrypto = {
            ETH: [],
            USDT: [],
            BTC: [],
            SOL: []
        };

        for (const row of result.rows) {
            if (addressesByCrypto[row.crypto]) {
                addressesByCrypto[row.crypto].push(row);
            }
        }

        // Monitor each crypto type with appropriate delays
        for (const crypto in addressesByCrypto) {
            const addresses = addressesByCrypto[crypto];
            
            if (addresses.length === 0) continue;
            
            console.log(`📊 Checking ${addresses.length} ${crypto} addresses...`);
            
            for (const row of addresses) {
                try {
                    await monitorAddress(row.user_id, row.address, row.crypto);
                } catch (error) {
                    console.error(`Error monitoring ${crypto} address ${row.address}:`, error.message);
                }
                
                // Different delays based on crypto (avoid rate limits)
                const delays = {
                    ETH: 2000,   // 2 seconds (ETH RPC)
                    USDT: 2000,  // 2 seconds (ETH RPC)
                    BTC: 5000,   // 5 seconds (BlockCypher - strict limits!)
                    SOL: 3000    // 3 seconds (Solana RPC - increased to avoid 429 errors)
                };
                
                await new Promise(resolve => setTimeout(resolve, delays[crypto] || 2000));
            }
            
            // Extra delay between crypto types
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

    } catch (error) {
        console.error('Error monitoring all addresses:', error);
    }
}

module.exports = {
    checkEthereumBalance,
    checkUSDTBalance,
    checkBitcoinBalance,
    checkSolanaBalance,
    monitorAddress,
    monitorAllAddresses,
    processIncomingTransaction
};

