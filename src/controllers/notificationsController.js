const pool = require('../config/database');

// Get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        
        const result = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [userId]
        );
        
        res.json({
            success: true,
            notifications: result.rows
        });
        
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        const { notificationId } = req.params;
        
        await pool.query(
            `UPDATE notifications 
             SET read = TRUE 
             WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        );
        
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
        
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read'
        });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        
        await pool.query(
            `UPDATE notifications 
             SET read = TRUE 
             WHERE user_id = $1 AND read = FALSE`,
            [userId]
        );
        
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
        
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notifications as read'
        });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.userId;
        
        const result = await pool.query(
            `SELECT COUNT(*) as count 
             FROM notifications 
             WHERE user_id = $1 AND read = FALSE`,
            [userId]
        );
        
        res.json({
            success: true,
            count: parseInt(result.rows[0].count)
        });
        
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count'
        });
    }
};


