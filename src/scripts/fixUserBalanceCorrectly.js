const pool = require('../config/database');
const axios = require('axios');

async function fixUserBalance() {
    const client = await pool.connect();
    try {
        const userId = 1; // User 'test'
        
        await client.query('BEGIN');
        
        console.log('====================================');
        console.log('🔧 FIXING USER BALANCE');
        console.log('====================================\n');
        
        // 1. Get current balance
        const currentUser = await client.query('SELECT balance, total_earnings FROM users WHERE id = $1', [userId]);
        console.log(`📊 CURRENT BALANCE: ${currentUser.rows[0].balance} USDT`);
        console.log(`📊 TOTAL EARNINGS: ${currentUser.rows[0].total_earnings} USDT\n`);
        
        // 2. Reset balance to 0 (remove fake balance)
        await client.query('UPDATE users SET balance = 0 WHERE id = $1', [userId]);
        console.log('✅ Reset balance to 0 (removed fake balance)\n');
        
        // 3. Get all approved deposits
        const deposits = await client.query(
            'SELECT id, amount, crypto, tx_hash, created_at FROM deposits WHERE user_id = $1 AND status = \'approved\' ORDER BY created_at ASC',
            [userId]
        );
        
        console.log(`📦 Found ${deposits.rows.length} approved deposits:\n`);
        
        let totalUsdValue = 0;
        
        for (const deposit of deposits.rows) {
            const amount = parseFloat(deposit.amount);
            const crypto = deposit.crypto;
            
            console.log(`  💎 ${amount} ${crypto} (${deposit.created_at})`);
            
            // Get current crypto price
            let priceUSD = 1;
            
            if (crypto === 'USDT') {
                priceUSD = 1;
            } else if (crypto === 'ETH') {
                const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                priceUSD = response.data.ethereum.usd;
            } else if (crypto === 'BTC') {
                const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
                priceUSD = response.data.bitcoin.usd;
            } else if (crypto === 'SOL') {
                const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
                priceUSD = response.data.solana.usd;
            }
            
            const usdValue = amount * priceUSD;
            totalUsdValue += usdValue;
            
            console.log(`     └─ ${crypto} price: $${priceUSD}`);
            console.log(`     └─ USD value: $${usdValue.toFixed(2)}\n`);
        }
        
        // 4. Update user balance with correct USD value
        await client.query('UPDATE users SET balance = $1 WHERE id = $2', [totalUsdValue, userId]);
        
        console.log('====================================');
        console.log(`✅ UPDATED BALANCE: $${totalUsdValue.toFixed(2)} USDT`);
        console.log('====================================\n');
        
        await client.query('COMMIT');
        
        // 5. Verify
        const finalUser = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);
        console.log(`✔️  Final balance: ${finalUser.rows[0].balance} USDT`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error fixing balance:', error);
    } finally {
        client.release();
        pool.end();
    }
}

fixUserBalance();

