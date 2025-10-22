const pool = require('../config/database');

async function checkUserBalance() {
    try {
        // Check user balance
        const userResult = await pool.query('SELECT * FROM users WHERE id = 1');
        console.log('\n👤 USER INFO:');
        console.log('ID:', userResult.rows[0].id);
        console.log('Name:', userResult.rows[0].full_name);
        console.log('Balance:', userResult.rows[0].balance, 'USDT');
        
        // Check deposits
        const depositsResult = await pool.query('SELECT * FROM deposits WHERE user_id = 1 ORDER BY created_at DESC');
        console.log('\n💰 DEPOSITS:');
        depositsResult.rows.forEach(deposit => {
            console.log(`- ${deposit.amount} ${deposit.crypto} | Status: ${deposit.status} | ${deposit.created_at}`);
        });
        
        // Check incoming transactions
        const txResult = await pool.query('SELECT * FROM incoming_transactions WHERE user_id = 1 ORDER BY created_at DESC');
        console.log('\n🔗 INCOMING TRANSACTIONS:');
        txResult.rows.forEach(tx => {
            console.log(`- ${tx.amount} ${tx.crypto} | Credited: ${tx.credited} | ${tx.tx_hash.substring(0, 20)}...`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

checkUserBalance();


