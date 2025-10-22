const pool = require('../config/database');

// ====== MLM PYRAMID SYSTEM ======

// Get ALL sub-referrals recursively (entire downline pyramid)
async function getAllDownlineReferrals(userId, currentLevel = 1, maxLevel = 10) {
    if (currentLevel > maxLevel) return [];
    
    try {
        // Get direct referrals
        const directReferrals = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.balance, u.total_earnings, u.level, 
                    u.created_at, u.referral_code, r.commission_earned
             FROM users u
             JOIN referrals r ON u.id = r.referred_id
             WHERE r.referrer_id = $1
             ORDER BY u.created_at DESC`,
            [userId]
        );
        
        let allReferrals = [];
        
        // Add direct referrals with their level in pyramid
        for (const referral of directReferrals.rows) {
            allReferrals.push({
                ...referral,
                pyramid_level: currentLevel, // 1 = direct, 2 = level 2, etc.
                referrer_id: userId
            });
            
            // Recursively get their referrals
            const subReferrals = await getAllDownlineReferrals(referral.id, currentLevel + 1, maxLevel);
            allReferrals = allReferrals.concat(subReferrals);
        }
        
        return allReferrals;
        
    } catch (error) {
        console.error('Error getting downline referrals:', error);
        return [];
    }
}

// Get team statistics and members (MLM PYRAMID)
exports.getTeam = async (req, res) => {
    try {
        const userId = req.userId;

        // Get user referral code
        const userResult = await pool.query(
            'SELECT referral_code FROM users WHERE id = $1',
            [userId]
        );

        const referralCode = userResult.rows[0].referral_code;

        // Get ALL referrals in pyramid (not just direct!)
        const allReferrals = await getAllDownlineReferrals(userId);

        // Calculate stats
        const totalMembers = allReferrals.length; // TOTAL in pyramid
        const activeMembers = allReferrals.filter(m => parseFloat(m.balance) > 0).length;
        const teamEarnings = allReferrals.reduce((sum, m) => sum + parseFloat(m.total_earnings || 0), 0);
        const commissionEarned = allReferrals.reduce((sum, m) => sum + parseFloat(m.commission_earned || 0), 0);

        // Count by pyramid level
        const level1Count = allReferrals.filter(m => m.pyramid_level === 1).length; // Direct
        const level2Count = allReferrals.filter(m => m.pyramid_level === 2).length;
        const level3PlusCount = allReferrals.filter(m => m.pyramid_level >= 3).length;

        // Format members data with pyramid level
        const members = allReferrals.map(member => ({
            id: member.id,
            name: member.full_name,
            email: member.email.replace(/(.{3}).+(@.+)/, '$1***$2'), // Mask email
            investment: parseFloat(member.balance).toFixed(2),
            earnings: parseFloat(member.total_earnings).toFixed(2),
            level: member.level,
            pyramidLevel: member.pyramid_level, // NEW: 1=direct, 2=level2, etc.
            joinDate: member.created_at,
            status: parseFloat(member.balance) > 0 ? 'active' : 'inactive',
            commissionEarned: parseFloat(member.commission_earned || 0).toFixed(2),
            referrerName: member.referrer_id === userId ? 'You' : 'Indirect'
        }));

        res.json({
            success: true,
            data: {
                referralCode: referralCode,
                referralLink: `${process.env.FRONTEND_URL || 'http://localhost'}/auth.html?ref=${referralCode}`,
                stats: {
                    totalMembers, // TOTAL pyramid size
                    activeMembers,
                    teamEarnings: teamEarnings.toFixed(2),
                    commissionEarned: commissionEarned.toFixed(2),
                    level1Count, // Direct referrals
                    level2Count, // Indirect (level 2)
                    level3PlusCount // Level 3+
                },
                members
            }
        });

    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get referral stats (MLM PYRAMID - counts ALL downline)
exports.getReferralStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Get ALL referrals in pyramid (not just direct!)
        const allReferrals = await getAllDownlineReferrals(userId);
        const totalReferrals = allReferrals.length; // TOTAL pyramid size

        // Get direct referrals count
        const directReferrals = allReferrals.filter(r => r.pyramid_level === 1).length;

        // Calculate level progress based on TOTAL referrals
        let currentLevel = 1;
        let nextLevelTarget = 5;
        let progress = totalReferrals;
        let bonusPercentage = 5;
        let dailyClicks = 3;

        if (totalReferrals >= 10) {
            currentLevel = 3;
            nextLevelTarget = totalReferrals;
            progress = totalReferrals;
            bonusPercentage = 10;
            dailyClicks = 7;
        } else if (totalReferrals >= 5) {
            currentLevel = 2;
            nextLevelTarget = 10;
            progress = totalReferrals;
            bonusPercentage = 8;
            dailyClicks = 5;
        }

        res.json({
            success: true,
            totalReferrals, // TOTAL in entire pyramid
            directReferrals, // Only direct (level 1)
            level: currentLevel,
            bonusPercentage,
            dailyClicks,
            nextLevelTarget,
            progress,
            referralsNeeded: Math.max(0, nextLevelTarget - totalReferrals)
        });

    } catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

module.exports = {
    getTeam: exports.getTeam,
    getReferralStats: exports.getReferralStats
};

