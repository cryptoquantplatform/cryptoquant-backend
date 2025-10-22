const pool = require('../config/database');
require('dotenv').config();

const createTables = async () => {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Creating database tables...');

        // Users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                referral_code VARCHAR(20) UNIQUE NOT NULL,
                referred_by VARCHAR(20),
                level INTEGER DEFAULT 1,
                balance DECIMAL(20, 8) DEFAULT 0,
                total_earnings DECIMAL(20, 8) DEFAULT 0,
                email_verified BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Users table created');

        // Admins table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Admins table created');

        // Email verification codes table
        await client.query(`
            CREATE TABLE IF NOT EXISTS verification_codes (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Verification codes table created');

        // Phone verification codes table
        await client.query(`
            CREATE TABLE IF NOT EXISTS phone_verification_codes (
                id SERIAL PRIMARY KEY,
                phone_number VARCHAR(20) NOT NULL,
                code VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Phone verification codes table created');

        // Daily clicks table
        await client.query(`
            CREATE TABLE IF NOT EXISTS daily_clicks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                clicks_used INTEGER DEFAULT 0,
                max_clicks INTEGER DEFAULT 3,
                today_earnings DECIMAL(20, 8) DEFAULT 0,
                last_reset DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Daily clicks table created');

        // Click history table
        await client.query(`
            CREATE TABLE IF NOT EXISTS click_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(20, 8) NOT NULL,
                percentage DECIMAL(5, 2) NOT NULL,
                balance_before DECIMAL(20, 8) NOT NULL,
                balance_after DECIMAL(20, 8) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Click history table created');

        // Referrals table
        await client.query(`
            CREATE TABLE IF NOT EXISTS referrals (
                id SERIAL PRIMARY KEY,
                referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                referred_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                commission_earned DECIMAL(20, 8) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(referrer_id, referred_id)
            );
        `);
        console.log('✅ Referrals table created');

        // Deposits table
        await client.query(`
            CREATE TABLE IF NOT EXISTS deposits (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(20, 8) NOT NULL,
                crypto VARCHAR(10) NOT NULL,
                wallet_address VARCHAR(255),
                tx_hash VARCHAR(255),
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                confirmed_at TIMESTAMP
            );
        `);
        console.log('✅ Deposits table created');

        // Withdrawals table
        await client.query(`
            CREATE TABLE IF NOT EXISTS withdrawals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(20, 8) NOT NULL,
                crypto VARCHAR(10) NOT NULL,
                wallet_address VARCHAR(255) NOT NULL,
                network_fee DECIMAL(20, 8) DEFAULT 0,
                final_amount DECIMAL(20, 8) NOT NULL,
                status VARCHAR(20) DEFAULT 'processing',
                tx_hash VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP
            );
        `);
        console.log('✅ Withdrawals table created');

        // Admin withdrawals table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_withdrawals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                admin_id INTEGER,
                amount DECIMAL(20, 8) NOT NULL,
                crypto VARCHAR(10) NOT NULL,
                admin_wallet_address VARCHAR(255) NOT NULL,
                reason TEXT,
                tx_hash VARCHAR(255),
                status VARCHAR(20) DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Admin withdrawals table created');

        // User deposit addresses table
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_deposit_addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                crypto VARCHAR(10) NOT NULL,
                address VARCHAR(255) NOT NULL,
                private_key_encrypted TEXT,
                derivation_path VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_checked TIMESTAMP,
                UNIQUE(user_id, crypto)
            );
        `);
        console.log('✅ User deposit addresses table created');

        // Remove old UNIQUE constraint on address if it exists (for ETH/USDT sharing)
        await client.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'user_deposit_addresses_address_key'
                ) THEN
                    ALTER TABLE user_deposit_addresses DROP CONSTRAINT user_deposit_addresses_address_key;
                END IF;
            END $$;
        `);
        console.log('✅ Removed UNIQUE(address) constraint (ETH/USDT can share addresses)');

        // Incoming transactions tracking table
        await client.query(`
            CREATE TABLE IF NOT EXISTS incoming_transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                deposit_address VARCHAR(255) NOT NULL,
                crypto VARCHAR(10) NOT NULL,
                tx_hash VARCHAR(255) UNIQUE NOT NULL,
                amount DECIMAL(20, 8) NOT NULL,
                confirmations INTEGER DEFAULT 0,
                required_confirmations INTEGER DEFAULT 3,
                status VARCHAR(20) DEFAULT 'pending',
                detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                confirmed_at TIMESTAMP,
                credited BOOLEAN DEFAULT FALSE,
                credited_at TIMESTAMP
            );
        `);
        console.log('✅ Incoming transactions table created');

        // Password reset codes table
        await client.query(`
            CREATE TABLE IF NOT EXISTS password_reset_codes (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Password reset codes table created');

        // Notifications table
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                data JSONB,
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Notifications table created');

        // System settings table
        await client.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id SERIAL PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value TEXT NOT NULL,
                description TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ System settings table created');

        // Insert default system settings
        await client.query(`
            INSERT INTO system_settings (setting_key, setting_value, description) VALUES
            ('min_deposit', '75', 'Minimum deposit amount in EUR'),
            ('min_withdrawal', '10', 'Minimum withdrawal amount'),
            ('click_percentage_min', '5', 'Minimum click earning percentage'),
            ('click_percentage_max', '8', 'Maximum click earning percentage'),
            ('level_1_clicks', '3', 'Daily clicks for level 1'),
            ('level_2_clicks', '5', 'Daily clicks for level 2'),
            ('level_2_referrals', '5', 'Referrals needed for level 2'),
            ('level_3_clicks', '7', 'Daily clicks for level 3'),
            ('level_3_referrals', '10', 'Referrals needed for level 3'),
            ('referral_commission_min', '3', 'Minimum referral commission %'),
            ('referral_commission_max', '5', 'Maximum referral commission %'),
            ('withdrawal_fee', '0', 'Withdrawal fee percentage'),
            ('platform_name', 'CryptoQuant', 'Platform name')
            ON CONFLICT (setting_key) DO NOTHING;
        `);
        console.log('✅ Default system settings inserted');

        // Create indexes for better performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
            CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
            CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
            CREATE INDEX IF NOT EXISTS idx_daily_clicks_user_id ON daily_clicks(user_id);
            CREATE INDEX IF NOT EXISTS idx_click_history_user_id ON click_history(user_id);
            CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
            CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
            CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
        `);
        console.log('✅ Database indexes created');

        console.log('🎉 Database initialization completed successfully!');
        
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// Run the initialization
createTables()
    .then(() => {
        console.log('✅ Database setup complete');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Database setup failed:', err);
        process.exit(1);
    });

