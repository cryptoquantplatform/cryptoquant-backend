// Direct API fix for referral columns
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Direct endpoint to create columns
app.post('/api/emergency/create-columns', async (req, res) => {
    try {
        console.log('🚨 Emergency column creation...');
        
        // Create referral_count column
        try {
            await pool.query('ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0');
            console.log('✅ referral_count created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✅ referral_count already exists');
            } else {
                throw error;
            }
        }
        
        // Create level column
        try {
            await pool.query('ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1');
            console.log('✅ level created');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('✅ level already exists');
            } else {
                throw error;
            }
        }
        
        res.json({
            success: true,
            message: 'Columns created successfully!'
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Test endpoint
app.get('/api/emergency/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({
            success: true,
            message: 'API is working!',
            time: result.rows[0].current_time
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Emergency API running on port ${PORT}`);
});
