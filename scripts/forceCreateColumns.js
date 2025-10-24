// Force create columns script for Render.com
const { Pool } = require('pg');

async function forceCreateColumns() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🚀 Force creating referral columns...');
        
        // Force add referral_count column
        try {
            await pool.query('ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0');
            console.log('✅ referral_count column created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✅ referral_count column already exists');
            } else {
                console.error('❌ Error creating referral_count:', error.message);
            }
        }
        
        // Force add level column
        try {
            await pool.query('ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1');
            console.log('✅ level column created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✅ level column already exists');
            } else {
                console.error('❌ Error creating level:', error.message);
            }
        }
        
        console.log('🎉 Columns creation completed!');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await pool.end();
    }
}

// Run immediately
forceCreateColumns();
