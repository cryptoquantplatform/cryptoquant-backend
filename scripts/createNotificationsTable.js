const pool = require('../config/database');

async function createNotificationsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
        `);
        
        console.log('✅ Notifications table created successfully!');
    } catch (error) {
        console.error('❌ Error creating notifications table:', error);
    } finally {
        pool.end();
    }
}

createNotificationsTable();

