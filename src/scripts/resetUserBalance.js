const pool = require('../config/database');

async function resetUserBalance() {
    try {
        // Get current balance
        const currentResult = await pool.query('SELECT balance FROM users WHERE full_name = $1', ['test']);
        console.log('\n📊 CURRENT BALANCE:', currentResult.rows[0].balance, 'USDT');
        
        // Reset to 0
        await pool.query('UPDATE users SET balance = 0 WHERE full_name = $1', ['test']);
        console.log('✅ Reset balance to 0');
        
        // Now credit the actual SOL deposit
        const depositResult = await pool.query(
            'SELECT SUM(amount) as total FROM deposits WHERE user_id = 1 AND status = $1',
            ['approved']
        );
        
        const totalDeposits = parseFloat(depositResult.rows[0].total || 0);
        console.log('💰 Total Approved Deposits:', totalDeposits, 'SOL');
        
        // Convert SOL to USD (assuming 1 SOL = ~$265)
        const solPrice = 265;
        const usdValue = totalDeposits * solPrice;
        
        console.log('💵 USD Value:', usdValue.toFixed(2), 'USDT');
        
        // Update balance with real value
        await pool.query('UPDATE users SET balance = $1 WHERE full_name = $2', [usdValue, 'test']);
        
        console.log('✅ Updated balance to', usdValue.toFixed(2), 'USDT');
        
        // Verify
        const finalResult = await pool.query('SELECT balance FROM users WHERE full_name = $1', ['test']);
        console.log('\n✅ FINAL BALANCE:', finalResult.rows[0].balance, 'USDT');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
}

resetUserBalance();


