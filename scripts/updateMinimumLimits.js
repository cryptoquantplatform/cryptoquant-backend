const pool = require('../config/database');

async function updateMinimumLimits() {
    try {
        console.log('🔧 Updating minimum deposit/withdrawal limits...');
        
        // Update min_deposit to 0
        await pool.query(`
            UPDATE system_settings 
            SET setting_value = '0', 
                description = 'Minimum deposit amount (0 = no minimum)'
            WHERE setting_key = 'min_deposit'
        `);
        console.log('✅ Updated min_deposit to 0');
        
        // Update min_withdrawal to 0
        await pool.query(`
            UPDATE system_settings 
            SET setting_value = '0',
                description = 'Minimum withdrawal amount (0 = no minimum)'
            WHERE setting_key = 'min_withdrawal'
        `);
        console.log('✅ Updated min_withdrawal to 0');
        
        console.log('🎉 All limits updated successfully!');
        console.log('');
        console.log('✅ System now accepts ANY deposit amount');
        console.log('✅ System now allows ANY withdrawal amount');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating limits:', error);
        process.exit(1);
    }
}

updateMinimumLimits();







