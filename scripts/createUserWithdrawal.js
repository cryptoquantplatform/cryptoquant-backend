const pool = require('../config/database');

async function createWithdrawal() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const userId = 1;
        const amount = 0.70;
        const toAddress = '2ppGgmZQaQGgv284c811y34KYrEfLYgoAaDTtSeaNdJH';
        
        console.log('====================================');
        console.log('💸 CREATING WITHDRAWAL');
        console.log('====================================\n');
        
        // Check current balance
        const currentUser = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);
        console.log(`📊 Current balance: $${currentUser.rows[0].balance} USD`);
        
        // Update balance
        await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, userId]);
        console.log(`✅ Deducted: $${amount} USD`);
        
        // Create withdrawal record
        const networkFee = 0;
        const finalAmount = amount - networkFee;
        
        const result = await client.query(
            `INSERT INTO withdrawals (user_id, amount, crypto, wallet_address, network_fee, final_amount, status, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             RETURNING id`,
            [userId, amount, 'SOL', toAddress, networkFee, finalAmount, 'approved']
        );
        
        console.log('\n====================================');
        console.log('✅ WITHDRAWAL CREATED');
        console.log('====================================');
        console.log(`ID: ${result.rows[0].id}`);
        console.log(`Amount: $${amount} USD`);
        console.log(`Crypto: SOL`);
        console.log(`To address: ${toAddress}`);
        console.log(`Status: approved`);
        
        await client.query('COMMIT');
        
        const finalUser = await client.query('SELECT balance FROM users WHERE id = $1', [userId]);
        console.log(`\n📊 New balance: $${finalUser.rows[0].balance} USD`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error:', error);
    } finally {
        client.release();
        pool.end();
    }
}

createWithdrawal();

