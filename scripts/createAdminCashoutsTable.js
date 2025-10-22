const pool = require('../config/database');

async function createAdminCashoutsTable() {
    const client = await pool.connect();
    
    try {
        console.log('Creating admin_cashouts table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_cashouts (
                id SERIAL PRIMARY KEY,
                admin_id INTEGER REFERENCES admins(id),
                user_id INTEGER REFERENCES users(id),
                crypto VARCHAR(10) NOT NULL,
                amount DECIMAL(20, 8) NOT NULL,
                from_address VARCHAR(255) NOT NULL,
                to_address VARCHAR(255) NOT NULL,
                tx_hash VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ admin_cashouts table created successfully!');

    } catch (error) {
        console.error('❌ Error creating admin_cashouts table:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run if called directly
if (require.main === module) {
    createAdminCashoutsTable()
        .then(() => {
            console.log('Migration completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = createAdminCashoutsTable;


