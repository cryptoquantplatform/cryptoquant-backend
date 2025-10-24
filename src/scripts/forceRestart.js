// Force restart script for Render.com
const { Pool } = require('pg');

async function forceRestart() {
    console.log('🚨 FORCE RESTART: Creating referral columns...');
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // Force create columns with error handling
        try {
            await pool.query('ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0');
            console.log('✅ referral_count column created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✅ referral_count column already exists');
            } else {
                console.error('❌ referral_count error:', error.message);
            }
        }
        
        try {
            await pool.query('ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1');
            console.log('✅ level column created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✅ level column already exists');
            } else {
                console.error('❌ level error:', error.message);
            }
        }
        
        // Test update
        const testUser = await pool.query('SELECT id FROM users LIMIT 1');
        if (testUser.rows.length > 0) {
            const userId = testUser.rows[0].id;
            await pool.query(`
                UPDATE users 
                SET referral_count = 5, level = 2 
                WHERE id = $1
            `, [userId]);
            console.log('✅ Test update successful!');
        }
        
        console.log('🎉 FORCE RESTART COMPLETED!');
        
    } catch (error) {
        console.error('❌ FORCE RESTART FAILED:', error);
    } finally {
        await pool.end();
    }
}

forceRestart();

