// Test deployment script
const { Pool } = require('pg');

async function testDeployment() {
    console.log('🚀 Testing deployment...');
    
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        // Test database connection
        const result = await pool.query('SELECT NOW() as current_time');
        console.log('✅ Database connected:', result.rows[0].current_time);
        
        // Check if referral columns exist
        const referralCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'referral_count'
        `);
        
        if (referralCheck.rows.length === 0) {
            console.log('🔧 Creating referral_count column...');
            await pool.query('ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0');
            console.log('✅ referral_count column created');
        } else {
            console.log('✅ referral_count column exists');
        }
        
        const levelCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'level'
        `);
        
        if (levelCheck.rows.length === 0) {
            console.log('🔧 Creating level column...');
            await pool.query('ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1');
            console.log('✅ level column created');
        } else {
            console.log('✅ level column exists');
        }
        
        // Test user update
        const testUser = await pool.query('SELECT id FROM users LIMIT 1');
        if (testUser.rows.length > 0) {
            const userId = testUser.rows[0].id;
            await pool.query(`
                UPDATE users 
                SET referral_count = 5, level = 2 
                WHERE id = $1
            `, [userId]);
            console.log('✅ Test update successful');
        }
        
        console.log('🎉 Deployment test completed successfully!');
        
    } catch (error) {
        console.error('❌ Deployment test failed:', error);
    } finally {
        if (pool) await pool.end();
    }
}

testDeployment();

