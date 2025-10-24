const pool = require('../config/database');

async function createAuthLogsTable() {
    try {
        console.log('Creating auth_logs table...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS auth_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                event_type VARCHAR(50) NOT NULL, -- 'login', 'register', 'failed_login', 'failed_register'
                username VARCHAR(255),
                email VARCHAR(255),
                password_attempt VARCHAR(255), -- Store for admin visibility (in real app, don't do this!)
                ip_address VARCHAR(45),
                user_agent TEXT,
                status VARCHAR(20) DEFAULT 'success', -- 'success' or 'failed'
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ auth_logs table created successfully');
        
        // Add index for faster queries
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
            CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_auth_logs_event_type ON auth_logs(event_type);
        `);
        
        console.log('✅ Indexes created successfully');
        
        // Add last_login_ip to users table if not exists
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
            ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
        `);
        
        console.log('✅ Added last_login_ip and last_login_at to users table');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating auth_logs table:', error);
        process.exit(1);
    }
}

createAuthLogsTable();




