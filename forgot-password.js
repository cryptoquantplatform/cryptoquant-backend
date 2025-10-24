let userEmail = '';

// Step 1: Request password reset
document.getElementById('requestResetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        const response = await api.post('auth/forgot-password', { email });
        
        if (response.success) {
            userEmail = email;
            
            // Show success message
            alert('✅ Reset code sent to your email!');
            
            // Switch to reset form
            document.getElementById('requestResetForm').style.display = 'none';
            document.getElementById('resetPasswordForm').style.display = 'block';
            document.getElementById('sentEmail').textContent = email;
        } else {
            alert('❌ Error: ' + response.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
        
    } catch (error) {
        console.error('Request reset error:', error);
        alert('❌ Error sending reset code: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Step 2: Reset password with code
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const resetCode = document.getElementById('resetCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        alert('❌ Passwords do not match!');
        return;
    }
    
    // Validate password length
    if (newPassword.length < 8) {
        alert('❌ Password must be at least 8 characters!');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Resetting...';
    
    try {
        const response = await api.post('auth/reset-password', {
            email: userEmail,
            code: resetCode,
            newPassword: newPassword
        });
        
        if (response.success) {
            // Show success message
            document.getElementById('resetPasswordForm').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
        } else {
            alert('❌ Error: ' + response.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
        
    } catch (error) {
        console.error('Reset password error:', error);
        alert('❌ Error resetting password: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Resend code function
async function resendCode() {
    if (!userEmail) {
        alert('❌ No email found. Please start over.');
        window.location.reload();
        return;
    }
    
    try {
        const response = await api.post('auth/forgot-password', { email: userEmail });
        
        if (response.success) {
            alert('✅ New reset code sent to your email!');
        } else {
            alert('❌ Error: ' + response.message);
        }
        
    } catch (error) {
        console.error('Resend code error:', error);
        alert('❌ Error resending code: ' + error.message);
    }
}

// Auto-format reset code input (6 digits only)
document.getElementById('resetCode').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
});



