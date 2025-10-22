const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Admin authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's an admin token
        if (!decoded.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access only'
            });
        }

        req.adminId = decoded.adminId;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid admin token'
        });
    }
};


