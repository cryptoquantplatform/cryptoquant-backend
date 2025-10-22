const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { sendVerificationEmail } = require('../config/email');
const { 
    generateVerificationCode, 
    generateReferralCode, 
    isValidEmail 
} = require('../utils/helpers');

// Send verification code
exports.sendVerificationCode = async (req, res) => {
    try {
        const { email, fullName } = req.body;

        // Validate email
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Check if email already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Generate 6-digit code
        const code = generateVerificationCode();
        
        // Set expiration time (10 minutes from now)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Delete any existing codes for this email
        await pool.query(
            'DELETE FROM verification_codes WHERE email = $1',
            [email.toLowerCase()]
        );

        // Store verification code
        await pool.query(
            'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
            [email.toLowerCase(), code, expiresAt]
        );

        // Send email
        const emailResult = await sendVerificationEmail(email, code, fullName);

        if (!emailResult.success) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send verification email' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Verification code sent to your email'
        });

    } catch (error) {
        console.error('Send verification code error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Register user
exports.register = async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { fullName, email, password, verificationCode, referralCode } = req.body;

        // Validate inputs
        if (!fullName || !email || !password || !verificationCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Validate email
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 8 characters' 
            });
        }

        // Verify code
        const codeResult = await pool.query(
            'SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()',
            [email.toLowerCase(), verificationCode]
        );

        if (codeResult.rows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired verification code' 
            });
        }

        await client.query('BEGIN');

        // Mark code as used
        await client.query(
            'UPDATE verification_codes SET used = TRUE WHERE email = $1 AND code = $2',
            [email.toLowerCase(), verificationCode]
        );

        // Check if email already exists
        const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate unique referral code
        let userReferralCode;
        let isUnique = false;
        
        while (!isUnique) {
            userReferralCode = generateReferralCode();
            const existing = await client.query(
                'SELECT id FROM users WHERE referral_code = $1',
                [userReferralCode]
            );
            if (existing.rows.length === 0) {
                isUnique = true;
            }
        }

        // Verify referrer if code provided
        let referrerId = null;
        if (referralCode) {
            const referrer = await client.query(
                'SELECT id FROM users WHERE referral_code = $1',
                [referralCode]
            );
            if (referrer.rows.length > 0) {
                referrerId = referrer.rows[0].id;
            }
        }

        // Create user
        const newUser = await client.query(
            `INSERT INTO users (full_name, email, password_hash, referral_code, referred_by, email_verified) 
             VALUES ($1, $2, $3, $4, $5, TRUE) 
             RETURNING id, full_name, email, referral_code, created_at`,
            [fullName, email.toLowerCase(), passwordHash, userReferralCode, referralCode || null]
        );

        const userId = newUser.rows[0].id;

        // Create daily clicks record
        await client.query(
            'INSERT INTO daily_clicks (user_id, max_clicks) VALUES ($1, $2)',
            [userId, 3]
        );

        // Create referral relationship if applicable
        if (referrerId) {
            await client.query(
                'INSERT INTO referrals (referrer_id, referred_id) VALUES ($1, $2)',
                [referrerId, userId]
            );
        }

        await client.query('COMMIT');

        // Generate JWT token
        const token = jwt.sign(
            { userId: userId, email: email.toLowerCase() },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: newUser.rows[0].id,
                fullName: newUser.rows[0].full_name,
                email: newUser.rows[0].email,
                referralCode: newUser.rows[0].referral_code,
                createdAt: newUser.rows[0].created_at
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    } finally {
        client.release();
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }

        // Find user
        const result = await pool.query(
            'SELECT id, full_name, email, password_hash, is_active FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({ 
                success: false, 
                message: 'Account has been deactivated' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, full_name, email, referral_code, level, balance, total_earnings, 
                    email_verified, created_at 
             FROM users WHERE id = $1`,
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Forgot password - send reset code
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Check if user exists
        const userResult = await pool.query(
            'SELECT id, full_name FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (userResult.rows.length === 0) {
            // Don't reveal if email exists for security
            return res.json({ 
                success: true, 
                message: 'If that email is registered, you will receive a reset code.' 
            });
        }

        const user = userResult.rows[0];

        // Generate 6-digit reset code
        const code = generateVerificationCode();
        
        // Set expiration time (15 minutes from now)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Delete any existing reset codes for this email
        await pool.query(
            'DELETE FROM password_reset_codes WHERE email = $1',
            [email.toLowerCase()]
        );

        // Store reset code
        await pool.query(
            `INSERT INTO password_reset_codes (email, code, expires_at)
             VALUES ($1, $2, $3)`,
            [email.toLowerCase(), code, expiresAt]
        );

        // Send reset email
        try {
            await sendVerificationEmail(email, code, user.full_name, 'Password Reset');
            console.log(`✅ Password reset code sent to ${email}: ${code}`);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            return res.status(500).json({ 
                success: false, 
                message: 'Error sending reset email. Please try again.' 
            });
        }

        res.json({
            success: true,
            message: 'Reset code sent to your email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Reset password with code
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Validate inputs
        if (!email || !code || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 8 characters' 
            });
        }

        // Verify reset code
        const codeResult = await pool.query(
            `SELECT id FROM password_reset_codes 
             WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()`,
            [email.toLowerCase(), code]
        );

        if (codeResult.rows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset code' 
            });
        }

        // Check if user exists
        const userResult = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2',
            [hashedPassword, email.toLowerCase()]
        );

        // Mark reset code as used
        await pool.query(
            'UPDATE password_reset_codes SET used = TRUE WHERE id = $1',
            [codeResult.rows[0].id]
        );

        console.log(`✅ Password reset successfully for ${email}`);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

module.exports = {
    sendVerificationCode: exports.sendVerificationCode,
    register: exports.register,
    login: exports.login,
    getCurrentUser: exports.getCurrentUser,
    forgotPassword: exports.forgotPassword,
    resetPassword: exports.resetPassword
};
