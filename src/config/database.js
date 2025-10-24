const { Pool } = require('pg');
require('dotenv').config();

// Log database connection info (without credentials)
console.log('🔍 Database Configuration:');
console.log('   DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DB_HOST:', process.env.DB_HOST || 'not set');

// Validate DATABASE_URL format
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgres')) {
    console.error('❌ Invalid DATABASE_URL format. Expected format: postgresql://username:password@host:port/database');
}

// ALWAYS use DATABASE_URL in production
const pool = new Pool(
    process.env.DATABASE_URL 
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }, // Always use SSL for external DB
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000, // Increased from 2000ms to 10000ms
        }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        }
);

// Test database connection with retry logic
let connectionAttempts = 0;
const maxAttempts = 5;

const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        client.release();
    } catch (err) {
        connectionAttempts++;
        console.error(`❌ Database connection attempt ${connectionAttempts}/${maxAttempts} failed:`, err.message);
        
        if (err.code === '28P01') {
            console.error('❌ AUTHENTICATION FAILED: Please check your DATABASE_URL credentials in Render dashboard');
            console.error('   - Verify username and password are correct');
            console.error('   - Check if database user has proper permissions');
            console.error('   - Ensure DATABASE_URL is properly set in environment variables');
        }
        
        if (connectionAttempts < maxAttempts) {
            console.log(`⏳ Retrying in 5 seconds...`);
            setTimeout(testConnection, 5000);
        } else {
            console.error('❌ Max database connection attempts reached. Please fix the DATABASE_URL and redeploy.');
        }
    }
};

// Initial connection test
testConnection();

pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err.message);
    if (err.code === '28P01') {
        console.error('❌ Database authentication error. Please check your credentials.');
    }
    // Don't exit process - let the app continue to run for health checks
});

module.exports = pool;


