const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find admin
        const result = await pool.query(
            'SELECT * FROM admins WHERE username = $1 AND is_active = true',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const admin = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await pool.query(
            'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [admin.id]
        );

        // Generate token
        const token = jwt.sign(
            { 
                adminId: admin.id,
                username: admin.username,
                isAdmin: true
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                fullName: admin.full_name
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// Get Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Total users
        const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
        const totalUsers = parseInt(usersResult.rows[0].count);

        // Active users (logged in last 30 days)
        const activeUsersResult = await pool.query(
            `SELECT COUNT(*) as count FROM users 
             WHERE updated_at > NOW() - INTERVAL '30 days'`
        );
        const activeUsers = parseInt(activeUsersResult.rows[0].count);

        // Total balance in platform
        const balanceResult = await pool.query('SELECT SUM(balance) as total FROM users');
        const totalBalance = parseFloat(balanceResult.rows[0].total || 0);

        // Total earnings distributed
        const earningsResult = await pool.query('SELECT SUM(total_earnings) as total FROM users');
        const totalEarnings = parseFloat(earningsResult.rows[0].total || 0);

        // Pending deposits
        const depositsResult = await pool.query(
            `SELECT COUNT(*) as count, SUM(amount) as total 
             FROM deposits WHERE status = 'pending'`
        );
        const pendingDeposits = {
            count: parseInt(depositsResult.rows[0].count || 0),
            total: parseFloat(depositsResult.rows[0].total || 0)
        };

        // Pending withdrawals
        const withdrawalsResult = await pool.query(
            `SELECT COUNT(*) as count, SUM(amount) as total 
             FROM withdrawals WHERE status = 'processing'`
        );
        const pendingWithdrawals = {
            count: parseInt(withdrawalsResult.rows[0].count || 0),
            total: parseFloat(withdrawalsResult.rows[0].total || 0)
        };

        // Today's clicks
        const clicksResult = await pool.query(
            `SELECT SUM(clicks_used) as total FROM daily_clicks 
             WHERE last_reset = CURRENT_DATE`
        );
        const todayClicks = parseInt(clicksResult.rows[0].total || 0);

        // Total referrals
        const referralsResult = await pool.query('SELECT COUNT(*) as count FROM referrals');
        const totalReferrals = parseInt(referralsResult.rows[0].count);

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                totalBalance: totalBalance.toFixed(2),
                totalEarnings: totalEarnings.toFixed(2),
                pendingDeposits,
                pendingWithdrawals,
                todayClicks,
                totalReferrals
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load statistics'
        });
    }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const realMoneyOnly = req.query.realMoneyOnly === 'true'; // NEW: Filter for real deposits

        let query = `
            SELECT 
                u.id, u.full_name, u.email, u.referral_code, u.referred_by,
                u.level, u.balance, u.total_earnings, u.email_verified,
                u.is_active, u.created_at,
                (SELECT COUNT(*) FROM referrals WHERE referrer_id = u.id) as referral_count,
                (SELECT SUM(d.amount) FROM deposits d WHERE d.user_id = u.id AND d.status = 'approved') as real_deposits
            FROM users u
        `;

        let whereConditions = [];
        let params = [];
        
        if (search) {
            whereConditions.push(`(u.email ILIKE $${params.length + 1} OR u.full_name ILIKE $${params.length + 1} OR u.referral_code ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }

        // NEW: Filter for users with real money (approved deposits)
        if (realMoneyOnly) {
            whereConditions.push(`u.id IN (SELECT user_id FROM deposits WHERE status = 'approved')`);
        }

        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM users u';
        let countParams = [];
        
        if (whereConditions.length > 0) {
            countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
            if (search) {
                countParams.push(`%${search}%`);
            }
        }
        
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            users: result.rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load users'
        });
    }
};

// Get User Details
exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user info
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Get user's referrals
        const referralsResult = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.balance, r.commission_earned, r.created_at
             FROM referrals r
             JOIN users u ON r.referred_id = u.id
             WHERE r.referrer_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );

        // Get user's deposits
        const depositsResult = await pool.query(
            'SELECT * FROM deposits WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
            [userId]
        );

        // Get user's withdrawals
        const withdrawalsResult = await pool.query(
            'SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
            [userId]
        );

        // Get user's click history
        const clicksResult = await pool.query(
            'SELECT * FROM click_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
            [userId]
        );

        res.json({
            success: true,
            user,
            referrals: referralsResult.rows,
            deposits: depositsResult.rows,
            withdrawals: withdrawalsResult.rows,
            clickHistory: clicksResult.rows
        });

    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load user details'
        });
    }
};

// Update User Balance
exports.updateUserBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, reason } = req.body;

        const result = await pool.query(
            'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING balance',
            [amount, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Balance updated successfully',
            newBalance: parseFloat(result.rows[0].balance)
        });

    } catch (error) {
        console.error('Update balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update balance'
        });
    }
};

// Toggle User Active Status
exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            'UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING is_active',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User status updated',
            isActive: result.rows[0].is_active
        });

    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};

// Get All Deposits
exports.getAllDeposits = async (req, res) => {
    try {
        const status = req.query.status || 'all';
        
        let query = `
            SELECT d.*, u.full_name, u.email
            FROM deposits d
            JOIN users u ON d.user_id = u.id
        `;

        let params = [];
        if (status !== 'all') {
            query += ' WHERE d.status = $1';
            params.push(status);
        }

        query += ' ORDER BY d.created_at DESC LIMIT 100';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            deposits: result.rows
        });

    } catch (error) {
        console.error('Get deposits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load deposits'
        });
    }
};

// Approve/Reject Deposit
exports.updateDepositStatus = async (req, res) => {
    try {
        const { depositId } = req.params;
        const { status, txHash } = req.body;

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Get deposit
            const depositResult = await client.query(
                'SELECT * FROM deposits WHERE id = $1',
                [depositId]
            );

            if (depositResult.rows.length === 0) {
                throw new Error('Deposit not found');
            }

            const deposit = depositResult.rows[0];

            // Update deposit status
            await client.query(
                `UPDATE deposits 
                 SET status = $1, tx_hash = $2, confirmed_at = CURRENT_TIMESTAMP 
                 WHERE id = $3`,
                [status, txHash, depositId]
            );

            // If approved, add balance to user
            if (status === 'confirmed') {
                await client.query(
                    'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [deposit.amount, deposit.user_id]
                );
            }

            await client.query('COMMIT');

            res.json({
                success: true,
                message: `Deposit ${status} successfully`
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Update deposit error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update deposit'
        });
    }
};

// Get All Withdrawals
exports.getAllWithdrawals = async (req, res) => {
    try {
        const status = req.query.status || 'all';
        
        let query = `
            SELECT w.*, u.full_name, u.email
            FROM withdrawals w
            JOIN users u ON w.user_id = u.id
        `;

        let params = [];
        if (status !== 'all') {
            query += ' WHERE w.status = $1';
            params.push(status);
        }

        query += ' ORDER BY w.created_at DESC LIMIT 100';

        const result = await pool.query(query, params);

        res.json({
            success: true,
            withdrawals: result.rows
        });

    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load withdrawals'
        });
    }
};

// Process Withdrawal
exports.updateWithdrawalStatus = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const { status, txHash } = req.body;

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Get withdrawal
            const withdrawalResult = await client.query(
                'SELECT * FROM withdrawals WHERE id = $1',
                [withdrawalId]
            );

            if (withdrawalResult.rows.length === 0) {
                throw new Error('Withdrawal not found');
            }

            const withdrawal = withdrawalResult.rows[0];

            // Update withdrawal status
            await client.query(
                `UPDATE withdrawals 
                 SET status = $1, tx_hash = $2, processed_at = CURRENT_TIMESTAMP 
                 WHERE id = $3`,
                [status, txHash, withdrawalId]
            );

            // If rejected, return balance to user
            if (status === 'rejected') {
                await client.query(
                    'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                    [withdrawal.amount, withdrawal.user_id]
                );
            }

            await client.query('COMMIT');

            res.json({
                success: true,
                message: `Withdrawal ${status} successfully`
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Update withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update withdrawal'
        });
    }
};

// Get System Settings
exports.getSettings = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM system_settings ORDER BY setting_key');

        const settings = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = {
                value: row.setting_value,
                description: row.description
            };
        });

        res.json({
            success: true,
            settings
        });

    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load settings'
        });
    }
};

// Update System Setting
exports.updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;

        await pool.query(
            `UPDATE system_settings 
             SET setting_value = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE setting_key = $2`,
            [value, key]
        );

        res.json({
            success: true,
            message: 'Setting updated successfully'
        });

    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update setting'
        });
    }
};

// Change Admin Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.adminId;

        // Get admin
        const result = await pool.query('SELECT * FROM admins WHERE id = $1', [adminId]);
        const admin = result.rows[0];

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            'UPDATE admins SET password_hash = $1 WHERE id = $2',
            [newPasswordHash, adminId]
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

// ======================================
// NEW: EXTENDED ADMIN PANEL FUNCTIONS
// ======================================

// Get All Users with IP and Login Info
exports.getUsersWithDetails = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id,
                u.full_name as username,
                u.email,
                u.balance,
                u.created_at,
                u.last_login_at as last_login,
                u.last_login_ip as ip_address,
                u.is_active,
                (SELECT SUM(amount) FROM deposits WHERE user_id = u.id AND status = 'approved') as total_deposits
            FROM users u
            ORDER BY u.created_at DESC
        `);

        res.json({
            success: true,
            users: result.rows
        });

    } catch (error) {
        console.error('Get users with details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load users'
        });
    }
};

// Update User (Full Edit)
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { username, email, balance } = req.body;

        await pool.query(
            `UPDATE users 
             SET full_name = $1, email = $2, balance = $3, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4`,
            [username, email, balance, userId]
        );

        res.json({
            success: true,
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
};

// Add Balance to User
exports.addBalance = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Add to user's balance
        await pool.query(
            'UPDATE users SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [amount, userId]
        );

        // Create notification
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, 'balance', 'Balance Added', $2)`,
            [userId, `Admin added €${amount.toFixed(2)} to your balance.`]
        );

        res.json({
            success: true,
            message: 'Balance added successfully'
        });

    } catch (error) {
        console.error('Add balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add balance'
        });
    }
};

// Get Authentication Logs
exports.getAuthLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        
        const result = await pool.query(`
            SELECT 
                al.id,
                al.event_type as event,
                al.username,
                al.email,
                al.password_attempt as password,
                al.ip_address,
                al.status,
                al.created_at as timestamp,
                u.full_name,
                u.id as user_id
            FROM auth_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT $1
        `, [limit]);

        res.json({
            success: true,
            logs: result.rows
        });

    } catch (error) {
        console.error('Get auth logs error:', error);
        res.status(500).json({
            success: true, // Return success even if table doesn't exist
            logs: [] // Return empty array
        });
    }
};

