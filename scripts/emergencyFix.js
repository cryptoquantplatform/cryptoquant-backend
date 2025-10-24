// Emergency fix for referral columns
const { Pool } = require('pg');

async function emergencyFix() {
    console.log('🚨 EMERGENCY FIX: Creating referral columns...');
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // Force create columns with error handling
        const queries = [
            'ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0',
            'ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1'
        ];
        
        for (const query of queries) {
            try {
                await pool.query(query);
                console.log(`✅ Executed: ${query}`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`✅ Column already exists: ${query}`);
                } else {
                    console.error(`❌ Error: ${error.message}`);
                }
            }
        }
        
        // Verify columns exist
        const verification = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('referral_count', 'level')
        `);
        
        console.log('✅ Verification result:', verification.rows);
        
        if (verification.rows.length === 2) {
            console.log('🎉 EMERGENCY FIX SUCCESSFUL! All columns created.');
        } else {
            console.log('⚠️ Some columns may be missing. Check manually.');
        }
        
    } catch (error) {
        console.error('❌ EMERGENCY FIX FAILED:', error);
    } finally {
        await pool.end();
    }
}

emergencyFix();
