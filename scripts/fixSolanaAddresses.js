const pool = require('../config/database');

async function fixSolanaAddresses() {
    try {
        // Delete old Solana addresses (they were generated in wrong format)
        const result = await pool.query(`
            DELETE FROM user_deposit_addresses 
            WHERE crypto = 'SOL'
        `);
        
        console.log(`✅ Deleted ${result.rowCount} old Solana addresses`);
        console.log('ℹ️  New Solana addresses will be generated automatically when users visit the deposit page');
        
    } catch (error) {
        console.error('❌ Error fixing Solana addresses:', error);
    } finally {
        pool.end();
    }
}

fixSolanaAddresses();

