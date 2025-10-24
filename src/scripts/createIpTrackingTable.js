const pool = require('../config/database');

async function createIpTrackingTable() {
    try {
        console.log('Creating ip_tracking table...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ip_tracking (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                ip_address VARCHAR(45) NOT NULL,
                country VARCHAR(100),
                city VARCHAR(100),
                is_vpn BOOLEAN DEFAULT false,
                is_proxy BOOLEAN DEFAULT false,
                is_tor BOOLEAN DEFAULT false,
                isp VARCHAR(255),
                user_agent TEXT,
                action VARCHAR(50), -- 'login', 'register', 'page_view', etc.
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ ip_tracking table created successfully');
        
        // Add indexes for faster queries
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_ip_tracking_user_id ON ip_tracking(user_id);
            CREATE INDEX IF NOT EXISTS idx_ip_tracking_ip ON ip_tracking(ip_address);
            CREATE INDEX IF NOT EXISTS idx_ip_tracking_created_at ON ip_tracking(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_ip_tracking_is_vpn ON ip_tracking(is_vpn);
        `);
        
        console.log('✅ Indexes created successfully');
        
        // Add ip_tracking fields to users table
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45),
            ADD COLUMN IF NOT EXISTS is_vpn_user BOOLEAN DEFAULT false;
        `);
        
        console.log('✅ Added IP tracking fields to users table');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating ip_tracking table:', error);
        process.exit(1);
    }
}

createIpTrackingTable();




