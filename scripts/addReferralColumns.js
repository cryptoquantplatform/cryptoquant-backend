const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addReferralColumns() {
    try {
        console.log('🔧 Adding referral_count and level columns...');
        
        // Check if referral_count column exists
        const referralCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'referral_count'
        `);
        
        if (referralCheck.rows.length === 0) {
            await pool.query('ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0');
            console.log('✅ Added referral_count column');
        } else {
            console.log('✅ referral_count column already exists');
        }
        
        // Check if level column exists
        const levelCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'level'
        `);
        
        if (levelCheck.rows.length === 0) {
            await pool.query('ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1');
            console.log('✅ Added level column');
        } else {
            console.log('✅ level column already exists');
        }
        
        console.log('🎉 All columns added successfully!');
        
    } catch (error) {
        console.error('❌ Error adding columns:', error);
    } finally {
        await pool.end();
    }
}

addReferralColumns();
