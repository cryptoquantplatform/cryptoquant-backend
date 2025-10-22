// Fix User Balance - Manual Correction Script
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixUserBalance() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 FIXING USER BALANCE\n');
        console.log('========================\n');
        
        const userId = 1; // User who deposited
        const solAmount = 0.001104362;
        const solPrice = 140; // Current SOL price (~$140)
        const correctUsdValue = solAmount * solPrice;
        
        console.log(`User ID: ${userId}`);
        console.log(`SOL Amount: ${solAmount}`);
        console.log(`SOL Price: $${solPrice}`);
        console.log(`Correct USD Value: $${correctUsdValue.toFixed(2)}`);
        console.log('');
        
        // Get current balance
        const userResult = await client.query(
            'SELECT id, full_name, email, balance FROM users WHERE id = $1',
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            console.log('❌ User not found!');
            return;
        }
        
        const user = userResult.rows[0];
        console.log(`Current User Balance: $${parseFloat(user.balance).toFixed(2)}`);
        console.log('');
        
        // Update balance
        await client.query(
            'UPDATE users SET balance = balance + $1 WHERE id = $2',
            [correctUsdValue, userId]
        );
        
        console.log(`✅ Added $${correctUsdValue.toFixed(2)} to user balance`);
        
        // Get updated balance
        const updatedResult = await client.query(
            'SELECT balance FROM users WHERE id = $1',
            [userId]
        );
        
        console.log(`✅ New Balance: $${parseFloat(updatedResult.rows[0].balance).toFixed(2)}`);
        console.log('');
        console.log('========================');
        console.log('✅ BALANCE FIXED!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set!');
    console.log('Set it with:');
    console.log('$env:DATABASE_URL="postgresql://cryptoquant_user:1P0vszEHrjBMDnGnBAmas4w7PE3ErVFb@dpg-d3sf91qli9vc73fpfug0-a.frankfurt-postgres.render.com/cryptoquant"');
    process.exit(1);
}

fixUserBalance()
    .then(() => {
        console.log('\n✅ Script completed');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Script failed:', err);
        process.exit(1);
    });

