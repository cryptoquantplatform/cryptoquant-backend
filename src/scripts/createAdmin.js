const pool = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
    const client = await pool.connect();
    
    try {
        console.log('🔐 Creating admin user...');

        // Admin credentials
        const username = 'admin';
        const password = 'Admin123!'; // CHANGE THIS AFTER FIRST LOGIN!
        const email = 'admin@cryptoquant.com';
        const fullName = 'System Administrator';

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if admin already exists
        const existingAdmin = await client.query(
            'SELECT * FROM admins WHERE username = $1',
            [username]
        );

        if (existingAdmin.rows.length > 0) {
            console.log('⚠️  Admin user already exists!');
            console.log('Username:', username);
            return;
        }

        // Create admin
        await client.query(
            `INSERT INTO admins (username, email, password_hash, full_name, is_active)
             VALUES ($1, $2, $3, $4, true)`,
            [username, email, passwordHash, fullName]
        );

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('╔════════════════════════════════════════╗');
        console.log('║   🔐 ADMIN CREDENTIALS                 ║');
        console.log('╠════════════════════════════════════════╣');
        console.log('║   Username: admin                      ║');
        console.log('║   Password: Admin123!                  ║');
        console.log('║   Email: admin@cryptoquant.com         ║');
        console.log('╠════════════════════════════════════════╣');
        console.log('║   ⚠️  CHANGE PASSWORD AFTER LOGIN!     ║');
        console.log('╚════════════════════════════════════════╝');
        console.log('');
        
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// Run the script
createAdmin()
    .then(() => {
        console.log('✅ Admin creation complete');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Admin creation failed:', err);
        process.exit(1);
    });



