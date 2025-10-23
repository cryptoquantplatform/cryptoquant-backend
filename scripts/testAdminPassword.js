const pool = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testAndResetPassword = async () => {
    try {
        console.log('🔍 Checking admin password...');
        
        const result = await pool.query(
            'SELECT password_hash FROM admins WHERE username = $1',
            ['admin']
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Admin user not found!');
            await pool.end();
            process.exit(1);
        }
        
        const hash = result.rows[0].password_hash;
        const isValid = await bcrypt.compare('Admin123!', hash);
        
        console.log('Password valid:', isValid);
        
        if (!isValid) {
            console.log('🔄 Resetting password to Admin123!...');
            const newHash = await bcrypt.hash('Admin123!', 10);
            await pool.query(
                'UPDATE admins SET password_hash = $1 WHERE username = $2',
                [newHash, 'admin']
            );
            console.log('✅ Password reset complete!');
        } else {
            console.log('✅ Password is correct!');
        }
        
        // Test JWT_SECRET
        const jwt = require('jsonwebtoken');
        if (!process.env.JWT_SECRET) {
            console.log('❌ JWT_SECRET is not set!');
        } else {
            console.log('✅ JWT_SECRET is set:', process.env.JWT_SECRET.substring(0, 20) + '...');
            
            // Test token generation
            const token = jwt.sign({ test: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('✅ JWT token generation works!');
        }
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
};

testAndResetPassword();


