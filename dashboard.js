// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!api.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // Load cached user data immediately (from previous session)
    loadCachedUserData();

    // Load dashboard data
    await loadDashboardData();
    await loadReferralStats();
});

// Load cached user data from localStorage/sessionStorage (instant, no API call)
function loadCachedUserData() {
    try {
        const cachedUser = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        if (cachedUser.full_name) {
            document.getElementById('username').textContent = cachedUser.full_name;
        }
        if (cachedUser.level) {
            document.getElementById('userLevel').textContent = cachedUser.level;
        }
    } catch (error) {
        // Ignore errors, API will load fresh data anyway
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Get user info
        const userResponse = await api.get('/auth/me');
        document.getElementById('username').textContent = userResponse.user.full_name;
        document.getElementById('userLevel').textContent = userResponse.user.level;
        
        // Cache user data for instant loading next time
        const rememberMe = localStorage.getItem('token') !== null;
        if (rememberMe) {
            localStorage.setItem('userData', JSON.stringify(userResponse.user));
        } else {
            sessionStorage.setItem('userData', JSON.stringify(userResponse.user));
        }
        
        // Get stats
        const statsResponse = await api.get('/dashboard/stats');
        document.getElementById('totalBalance').textContent = parseFloat(statsResponse.balance || 0).toFixed(2);
        document.getElementById('todayEarnings').textContent = '+' + parseFloat(statsResponse.todayEarnings || 0).toFixed(2) + ' USD';
        document.getElementById('totalEarnings').textContent = parseFloat(statsResponse.totalEarnings || 0).toFixed(2) + ' USD';
        
        // Update level badge color
        const levelBadge = document.getElementById('levelBadge');
        if (userResponse.user.level === 3) {
            levelBadge.style.background = 'linear-gradient(135deg, #a855f7, #9333ea)';
        } else if (userResponse.user.level === 2) {
            levelBadge.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else {
            levelBadge.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Error loading dashboard: ' + error.message);
    }
}

// Load referral stats
async function loadReferralStats() {
    try {
        const response = await api.get('/team/stats');
        
        // Update referral stats
        document.getElementById('totalReferrals').textContent = response.totalReferrals || 0;
        document.getElementById('bonusPercentage').textContent = (response.bonusPercentage || 5) + '%';
        
        // Calculate next level progress
        const currentReferrals = response.totalReferrals || 0;
        let nextLevelTarget, progress;
        
        if (currentReferrals < 5) {
            nextLevelTarget = 5;
            progress = currentReferrals + '/5';
        } else if (currentReferrals < 10) {
            nextLevelTarget = 10;
            progress = currentReferrals + '/10';
        } else {
            nextLevelTarget = 10;
            progress = 'Max Level';
        }
        
        document.getElementById('nextLevelProgress').textContent = progress;
        
        // Update level progress
        const currentLevel = response.level || 1;
        document.getElementById('currentLevel').textContent = currentLevel;
        
        // Update level perks
        let clicksPerDay = 3;
        let baseRate = 5;
        
        if (currentLevel === 3) {
            clicksPerDay = 7;
            baseRate = 10;
        } else if (currentLevel === 2) {
            clicksPerDay = 5;
            baseRate = 8;
        }
        
        document.querySelector('.level-perks').textContent = clicksPerDay + ' clicks/day • ' + baseRate + '% base rate';
        
        // Update progress bar
        let progressPercent = 0;
        if (currentLevel === 1) {
            progressPercent = (currentReferrals / 5) * 100;
        } else if (currentLevel === 2) {
            progressPercent = (currentReferrals / 10) * 100;
        } else {
            progressPercent = 100;
        }
        
        document.getElementById('levelProgress').style.width = progressPercent + '%';
        
        // Update referral link
        const userResponse = await api.get('/auth/me');
        const referralLink = window.location.origin + '/auth.html?ref=' + userResponse.user.referralCode;
        document.getElementById('referralLink').value = referralLink;
        
    } catch (error) {
        console.error('Error loading referral stats:', error);
    }
}

// Copy referral link
function copyReferralLink() {
    const referralInput = document.getElementById('referralLink');
    referralInput.select();
    document.execCommand('copy');
    
    alert('Referral link copied to clipboard!');
}

// Make functions available globally
window.copyReferralLink = copyReferralLink;
// Note: logout() is now defined globally in api-config.js
