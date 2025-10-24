const pool = require('../config/database');
const { 
    calculateUserLevel, 
    calculateEarningPercentage,
    formatBalance 
} = require('../utils/helpers');

// ====== MLM COMMISSION SYSTEM ======

// Count ALL downline referrals (entire pyramid)
async function countTotalReferrals(userId, maxLevel = 10) {
    async function countRecursive(currentUserId, level) {
        if (level > maxLevel) return 0;
        
        const directResult = await pool.query(
            'SELECT referred_id FROM referrals WHERE referrer_id = $1',
            [currentUserId]
        );
        
        let total = directResult.rows.length;
        
        for (const row of directResult.rows) {
            total += await countRecursive(row.referred_id, level + 1);
        }
        
        return total;
    }
    
    return await countRecursive(userId, 1);
}

// Get upline (all users ABOVE in pyramid)
async function getUpline(userId, maxLevels = 10) {
    const upline = [];
    let currentUserId = userId;
    let level = 1;
    
    while (level <= maxLevels) {
        // Find who referred this user
        const referrer = await pool.query(
            `SELECT r.referrer_id, u.full_name, u.email 
             FROM referrals r
             JOIN users u ON r.referrer_id = u.id
             WHERE r.referred_id = $1`,
            [currentUserId]
        );
        
        if (referrer.rows.length === 0) {
            break; // No more upline
        }
        
        upline.push({
            user_id: referrer.rows[0].referrer_id,
            full_name: referrer.rows[0].full_name,
            email: referrer.rows[0].email,
            pyramid_level: level
        });
        
        currentUserId = referrer.rows[0].referrer_id;
        level++;
    }
    
    return upline;
}

// Distribute commission to upline (MLM style)
async function distributeCommissionToUpline(client, clickerUserId, earnings) {
    try {
        // Get upline users
        const upline = await getUpline(clickerUserId);
        
        if (upline.length === 0) return; // No upline to pay
        
        // Realistic MLM commission structure (small percentages)
        const COMMISSION_RATES = {
            1: 0.015,  // 1.5% for direct referrals (Level 1)
            2: 0.005,  // 0.5% for indirect (Level 2)
            3: 0.001   // 0.1% for deep pyramid (Level 3+)
        };
        
        // Distribute commission to each upline member
        for (const uplineUser of upline) {
            // Get commission rate based on pyramid level
            let commissionRate;
            if (uplineUser.pyramid_level === 1) {
                commissionRate = COMMISSION_RATES[1]; // 1.5% for direct
            } else if (uplineUser.pyramid_level === 2) {
                commissionRate = COMMISSION_RATES[2]; // 0.5% for level 2
            } else {
                commissionRate = COMMISSION_RATES[3]; // 0.1% for level 3+
            }
            
            const commission = earnings * commissionRate;
            
            // Add commission to upline user's balance
            await client.query(
                'UPDATE users SET balance = balance + $1 WHERE id = $2',
                [formatBalance(commission), uplineUser.user_id]
            );
            
            // Update referrals table
            await client.query(
                `UPDATE referrals 
                 SET commission_earned = commission_earned + $1 
                 WHERE referrer_id = $2 AND referred_id IN (
                     SELECT id FROM users WHERE id = $3 OR id IN (
                         SELECT referred_id FROM referrals WHERE referrer_id = $3
                     )
                 )`,
                [formatBalance(commission), uplineUser.user_id, clickerUserId]
            );
            
            console.log(`💰 Commission: $${commission.toFixed(4)} USD (${(commissionRate * 100).toFixed(1)}%) to User ${uplineUser.user_id} [Pyramid Level ${uplineUser.pyramid_level}]`);
        }
        
    } catch (error) {
        console.error('Error distributing commission:', error);
        // Don't throw - commission distribution shouldn't block the click
    }
}

// Get dashboard data
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        // Get user data
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

        // Get TOTAL referral count (entire pyramid!)
        const totalReferrals = await countTotalReferrals(userId);

        // Calculate level
        const levelInfo = calculateUserLevel(totalReferrals);

        // Update user level if changed
        if (user.level !== levelInfo.level) {
            await pool.query(
                'UPDATE users SET level = $1 WHERE id = $2',
                [levelInfo.level, userId]
            );
        }

        // Get or create daily clicks record
        let dailyClicks = await pool.query(
            'SELECT * FROM daily_clicks WHERE user_id = $1',
            [userId]
        );

        if (dailyClicks.rows.length === 0) {
            await pool.query(
                'INSERT INTO daily_clicks (user_id, max_clicks) VALUES ($1, $2)',
                [userId, levelInfo.maxClicks]
            );
            dailyClicks = await pool.query(
                'SELECT * FROM daily_clicks WHERE user_id = $1',
                [userId]
            );
        }

        let clicksData = dailyClicks.rows[0];

        // Check if need to reset (new day)
        const lastReset = new Date(clicksData.last_reset);
        const today = new Date();
        
        if (lastReset.toDateString() !== today.toDateString()) {
            await pool.query(
                `UPDATE daily_clicks 
                 SET clicks_used = 0, today_earnings = 0, max_clicks = $1, last_reset = CURRENT_DATE 
                 WHERE user_id = $2`,
                [levelInfo.maxClicks, userId]
            );
            clicksData.clicks_used = 0;
            clicksData.today_earnings = 0;
            clicksData.max_clicks = levelInfo.maxClicks;
        }

        // Get click history
        const clickHistory = await pool.query(
            'SELECT * FROM click_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
            [userId]
        );

        // Get team earnings
        const teamEarnings = await pool.query(
            'SELECT SUM(commission_earned) as total FROM referrals WHERE referrer_id = $1',
            [userId]
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email,
                    referralCode: user.referral_code,
                    balance: formatBalance(user.balance),
                    totalEarnings: formatBalance(user.total_earnings),
                    level: levelInfo.level
                },
                clicks: {
                    clicksUsed: clicksData.clicks_used,
                    maxClicks: clicksData.max_clicks,
                    clicksRemaining: clicksData.max_clicks - clicksData.clicks_used,
                    todayEarnings: formatBalance(clicksData.today_earnings)
                },
                levelInfo: {
                    ...levelInfo,
                    progress: totalReferrals,
                    nextLevelTarget: levelInfo.level === 1 ? 5 : (levelInfo.level === 2 ? 10 : totalReferrals)
                },
                referrals: {
                    total: totalReferrals,
                    commissionEarned: formatBalance(teamEarnings.rows[0].total || 0)
                },
                clickHistory: clickHistory.rows
            }
        });

    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Perform click to earn
exports.performClick = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const userId = req.userId;

        // Get user data
        const userResult = await client.query(
            'SELECT * FROM users WHERE id = $1 FOR UPDATE',
            [userId]
        );

        const user = userResult.rows[0];

        // No minimum balance required - accept any amount!
        
        // Get TOTAL referral count (entire pyramid, not just direct!)
        const totalReferrals = await countTotalReferrals(userId);
        const levelInfo = calculateUserLevel(totalReferrals);

        // Get daily clicks
        let clicksData = await client.query(
            'SELECT * FROM daily_clicks WHERE user_id = $1 FOR UPDATE',
            [userId]
        );

        if (clicksData.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(500).json({ 
                success: false, 
                message: 'Clicks data not found' 
            });
        }

        let clicks = clicksData.rows[0];

        // Check if new day
        const lastReset = new Date(clicks.last_reset);
        const today = new Date();
        
        if (lastReset.toDateString() !== today.toDateString()) {
            await client.query(
                `UPDATE daily_clicks 
                 SET clicks_used = 0, today_earnings = 0, max_clicks = $1, last_reset = CURRENT_DATE 
                 WHERE user_id = $2`,
                [levelInfo.maxClicks, userId]
            );
            clicks.clicks_used = 0;
            clicks.today_earnings = 0;
            clicks.max_clicks = levelInfo.maxClicks;
        }

        // Check if clicks available
        if (clicks.clicks_used >= clicks.max_clicks) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: 'No clicks remaining today' 
            });
        }

        // Calculate earnings
        const percentage = calculateEarningPercentage(levelInfo.minPercent, levelInfo.maxPercent);
        const earnings = parseFloat(user.balance) * percentage;
        const newBalance = parseFloat(user.balance) + earnings;
        const newTotalEarnings = parseFloat(user.total_earnings) + earnings;
        const newTodayEarnings = parseFloat(clicks.today_earnings) + earnings;

        // Update user balance
        await client.query(
            'UPDATE users SET balance = $1, total_earnings = $2 WHERE id = $3',
            [formatBalance(newBalance), formatBalance(newTotalEarnings), userId]
        );

        // Update clicks
        await client.query(
            'UPDATE daily_clicks SET clicks_used = clicks_used + 1, today_earnings = $1 WHERE user_id = $2',
            [formatBalance(newTodayEarnings), userId]
        );

        // Add to history
        await client.query(
            `INSERT INTO click_history (user_id, amount, percentage, balance_before, balance_after) 
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, formatBalance(earnings), (percentage * 100).toFixed(2), 
             formatBalance(user.balance), formatBalance(newBalance)]
        );

        // ====== MLM COMMISSION DISTRIBUTION ======
        // Distribute commission to ALL upline members (pyramid system)
        await distributeCommissionToUpline(client, userId, earnings);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Earnings added successfully',
            earned: formatBalance(earnings),
            percentage: (percentage * 100).toFixed(2),
            newBalance: formatBalance(newBalance),
            clicksRemaining: clicks.max_clicks - clicks.clicks_used - 1
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Perform click error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    } finally {
        client.release();
    }
};

// Get stats
exports.getStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Get user data
        const userResult = await pool.query(
            'SELECT balance, total_earnings FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const user = userResult.rows[0];

        // Get today's earnings
        const dailyClicks = await pool.query(
            'SELECT today_earnings FROM daily_clicks WHERE user_id = $1',
            [userId]
        );

        const todayEarnings = dailyClicks.rows.length > 0 ? dailyClicks.rows[0].today_earnings : 0;

        res.json({
            success: true,
            balance: formatBalance(user.balance),
            totalEarnings: formatBalance(user.total_earnings),
            todayEarnings: formatBalance(todayEarnings)
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get clicks info
exports.getClicks = async (req, res) => {
    try {
        const userId = req.userId;

        // Get user balance
        const userResult = await pool.query(
            'SELECT balance FROM users WHERE id = $1',
            [userId]
        );

        const currentBalance = userResult.rows[0].balance;

        // Get TOTAL referral count for level calculation (entire pyramid!)
        const totalReferrals = await countTotalReferrals(userId);
        const levelInfo = calculateUserLevel(totalReferrals);

        // Get or create daily clicks record
        let dailyClicks = await pool.query(
            'SELECT * FROM daily_clicks WHERE user_id = $1',
            [userId]
        );

        if (dailyClicks.rows.length === 0) {
            await pool.query(
                'INSERT INTO daily_clicks (user_id, max_clicks) VALUES ($1, $2)',
                [userId, levelInfo.maxClicks]
            );
            dailyClicks = await pool.query(
                'SELECT * FROM daily_clicks WHERE user_id = $1',
                [userId]
            );
        }

        let clicksData = dailyClicks.rows[0];

        // Check if need to reset (new day)
        const lastReset = new Date(clicksData.last_reset);
        const today = new Date();
        
        if (lastReset.toDateString() !== today.toDateString()) {
            await pool.query(
                `UPDATE daily_clicks 
                 SET clicks_used = 0, today_earnings = 0, max_clicks = $1, last_reset = CURRENT_DATE 
                 WHERE user_id = $2`,
                [levelInfo.maxClicks, userId]
            );
            clicksData.clicks_used = 0;
            clicksData.today_earnings = 0;
            clicksData.max_clicks = levelInfo.maxClicks;
        }

        res.json({
            success: true,
            clicksUsed: clicksData.clicks_used,
            maxClicks: clicksData.max_clicks,
            currentBalance: formatBalance(currentBalance),
            todayEarnings: formatBalance(clicksData.today_earnings)
        });

    } catch (error) {
        console.error('Get clicks error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get click history
exports.getClickHistory = async (req, res) => {
    try {
        const userId = req.userId;

        // Get today's click history
        const clickHistory = await pool.query(
            `SELECT * FROM click_history 
             WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            history: clickHistory.rows
        });

    } catch (error) {
        console.error('Get click history error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

module.exports = exports;

