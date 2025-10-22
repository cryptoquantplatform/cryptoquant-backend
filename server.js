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
const adminWalletsController = require('./controllers/adminWalletsController');
const depositAddressController = require('./controllers/depositAddressController');
const notificationsController = require('./controllers/notificationsController');
const authMiddleware = require('./middleware/auth');
const adminAuthMiddleware = require('./middleware/adminAuth');

const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Increased from 5 to 50 for development
    message: 'Too many authentication attempts, please try again later.'
});

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

// ====== AUTH ROUTES ======
app.post('/api/auth/send-code', authLimiter, authController.sendVerificationCode);
app.post('/api/auth/register', authLimiter, authController.register);
app.post('/api/auth/login', authLimiter, authController.login);
app.get('/api/auth/me', authMiddleware, authController.getCurrentUser);
app.post('/api/auth/forgot-password', authLimiter, authController.forgotPassword);
app.post('/api/auth/reset-password', authLimiter, authController.resetPassword);

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

// ====== DEPOSIT ADDRESS ROUTES (Auto Crypto) ======
app.get('/api/deposit-addresses', authMiddleware, depositAddressController.getDepositAddresses);
app.get('/api/deposit-addresses/qr/:address', authMiddleware, depositAddressController.generateQRCode);
app.post('/api/deposit-addresses/check', authMiddleware, depositAddressController.checkTransactions);
app.get('/api/deposit-history', authMiddleware, depositAddressController.getDepositHistory);

// ====== TEAM/REFERRAL ROUTES ======
app.get('/api/team', authMiddleware, teamController.getTeam);
app.get('/api/team/stats', authMiddleware, teamController.getReferralStats);

// ====== ADMIN ROUTES ======
app.post('/api/admin/login', authLimiter, adminController.login);
app.get('/api/admin/dashboard-stats', adminAuthMiddleware, adminController.getDashboardStats);
app.get('/api/admin/users', adminAuthMiddleware, adminController.getAllUsers);
app.get('/api/admin/users/:userId', adminAuthMiddleware, adminController.getUserDetails);
app.put('/api/admin/users/:userId/balance', adminAuthMiddleware, adminController.updateUserBalance);
app.put('/api/admin/users/:userId/toggle-status', adminAuthMiddleware, adminController.toggleUserStatus);
app.delete('/api/admin/users/:userId', adminAuthMiddleware, adminController.deleteUser);
app.get('/api/admin/deposits', adminAuthMiddleware, adminController.getAllDeposits);
app.put('/api/admin/deposits/:depositId', adminAuthMiddleware, adminController.updateDepositStatus);
app.get('/api/admin/withdrawals', adminAuthMiddleware, adminController.getAllWithdrawals);
app.put('/api/admin/withdrawals/:withdrawalId', adminAuthMiddleware, adminController.updateWithdrawalStatus);
app.get('/api/admin/settings', adminAuthMiddleware, adminController.getSettings);
app.put('/api/admin/settings', adminAuthMiddleware, adminController.updateSetting);
app.post('/api/admin/change-password', adminAuthMiddleware, adminController.changePassword);

// ====== ADMIN WALLETS ROUTES ======
app.get('/api/admin/admin-wallets/summary', adminAuthMiddleware, adminWalletsController.getWalletsSummary);
app.get('/api/admin/admin-wallets/user/:userId', adminAuthMiddleware, adminWalletsController.getUserDeposits);
app.post('/api/admin/admin-wallets/withdraw', adminAuthMiddleware, adminWalletsController.processWithdrawal);
app.get('/api/admin/admin-wallets/history', adminAuthMiddleware, adminWalletsController.getWithdrawalHistory);
app.get('/api/admin/admin-wallets/user-balances/:userId', adminAuthMiddleware, adminWalletsController.getUserWalletBalances);
app.post('/api/admin/admin-wallets/cashout', adminAuthMiddleware, adminWalletsController.cashoutUserWallet);

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
// START SERVER
// ============================================

app.listen(PORT, () => {
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
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

module.exports = app;

