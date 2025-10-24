// INSTANT FIX for referral columns - NO WAITING
const { Pool } = require('pg');

async function instantFix() {
    console.log('🚨 INSTANT FIX: Creating referral columns...');
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // Force create columns
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1');
        
        console.log('✅ Columns created successfully!');
        
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
        
        console.log('🎉 INSTANT FIX COMPLETED!');
        
    } catch (error) {
        console.error('❌ INSTANT FIX FAILED:', error);
    } finally {
        await pool.end();
    }
}

instantFix();

