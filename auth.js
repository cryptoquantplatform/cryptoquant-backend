// Authentication JavaScript

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Auto-fill referral code from URL if present
    autoFillReferralCode();
    
    initializeSendCodeButton();
    initializeResendButton();
    initializeRegisterForm();
    initializeLoginForm();
});

// Auto-fill referral code from URL parameter (?ref=CODE)
function autoFillReferralCode() {
    const referralInput = document.getElementById('referralCode');
    if (!referralInput) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
        referralInput.value = refCode;
        referralInput.style.background = 'rgba(16, 185, 129, 0.1)';
        referralInput.style.borderColor = '#10b981';
        console.log(`✅ Referral code auto-filled: ${refCode}`);
    }
}

// Initialize Send Verification Code button
function initializeSendCodeButton() {
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    if (!sendCodeBtn) return;
    
    sendCodeBtn.addEventListener('click', async function() {
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsCheckbox = document.querySelector('input[name="terms"]');
        
        // Validate
        if (!fullname || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        if (password.length < 8) {
            alert('Password must be at least 8 characters long!');
            return;
        }
        
        if (!termsCheckbox.checked) {
            alert('Please accept the Terms & Conditions');
            return;
        }
        
        // Disable button
        sendCodeBtn.disabled = true;
        sendCodeBtn.textContent = 'Sending Code...';
        
        try {
            // Send verification code
            await api.post('/auth/send-code', {
                email: email,
                fullName: fullname
            });
            
            // Show verification section
            document.getElementById('verificationSection').style.display = 'block';
            sendCodeBtn.style.display = 'none';
            
            alert('Verification code sent to ' + email);
            
        } catch (error) {
            alert('Failed to send code: ' + error.message);
            sendCodeBtn.disabled = false;
            sendCodeBtn.textContent = 'Send Verification Code';
        }
    });
}

// Initialize Resend button
function initializeResendButton() {
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    if (!resendCodeBtn) return;
    
    resendCodeBtn.addEventListener('click', async function() {
        const email = document.getElementById('email').value;
        const fullname = document.getElementById('fullname').value;
        
        if (!email) {
            alert('Email not provided');
            return;
        }
        
        resendCodeBtn.disabled = true;
        resendCodeBtn.textContent = 'Sending...';
        
        try {
            await api.post('/auth/send-code', {
                email: email,
                fullName: fullname
            });
            
            alert('New code sent to your email!');
            
            // Re-enable after 30 seconds
            setTimeout(() => {
                resendCodeBtn.disabled = false;
                resendCodeBtn.textContent = 'Resend';
            }, 30000);
            
        } catch (error) {
            alert('Failed to resend code: ' + error.message);
            resendCodeBtn.disabled = false;
            resendCodeBtn.textContent = 'Resend';
        }
    });
}

// Initialize Register Form
function initializeRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const verificationCode = document.getElementById('verificationCode').value;
        const referralCode = document.getElementById('referralCode').value;
        const submitBtn = document.getElementById('verifyAndRegisterBtn');
        
        // Validate
        if (!verificationCode || verificationCode.length !== 6) {
            alert('Please enter the 6-digit verification code from your email');
            return;
        }
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        
        try {
            // Register via API
            const response = await api.post('/auth/register', {
                fullName: fullname,
                email: email,
                password: password,
                verificationCode: verificationCode,
                referralCode: referralCode || null
            });
            
            // Store token
            api.setToken(response.token);
            
            // Store user data
            localStorage.setItem('userData', JSON.stringify(response.user));
            
            // Show success
            alert('Registration successful! Welcome to DCPTG!');
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            alert('Registration failed: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Verify & Create Account';
        }
    });
}

// Initialize Login Form
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.querySelector('input[name="remember"]').checked;
        const submitBtn = loginForm.querySelector('.submit-btn');
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        try {
            // Call API
            const response = await api.post('/auth/login', {
                email: email,
                password: password
            });
            
            // Store token (localStorage if remember me, sessionStorage otherwise)
            api.setToken(response.token, rememberMe);
            
            // Store user data for quick access
            if (rememberMe) {
                localStorage.setItem('userData', JSON.stringify(response.user));
            } else {
                sessionStorage.setItem('userData', JSON.stringify(response.user));
            }
            
            console.log(`✅ Login successful! Remember Me: ${rememberMe}`);
            
            // Show success message
            alert('Login successful! Redirecting to dashboard...');
            window.location.href = '/dashboard';
            
        } catch (error) {
            alert('Login failed: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
}

// Check if user is logged in
function checkAuth() {
    const isPublicPage = window.location.href.includes('/login') || 
                        window.location.href.includes('/register') || 
                        window.location.href.includes('/index') ||
                        window.location.href.includes('/about') ||
                        window.location.href.includes('/auth');
    
    if (!isPublicPage && !api.isAuthenticated()) {
        window.location.href = '/auth';
    }
}

// Call checkAuth on page load for protected pages
window.addEventListener('DOMContentLoaded', checkAuth);
