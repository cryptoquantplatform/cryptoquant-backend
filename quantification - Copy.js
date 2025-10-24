// Quantification JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!api.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Load initial data
    await loadStatistics();
    await loadClickData();
    await loadClickHistory();
    
    // Set up click button
    const clickBtn = document.getElementById('clickToEarnBtn');
    if (clickBtn) {
        clickBtn.addEventListener('click', performClick);
    }
    
    // Start countdown timer
    startCountdown();
});

// Load statistics
async function loadStatistics() {
    try {
        const response = await api.get('/dashboard/stats');
        
        // Update statistics
        document.getElementById('balance').textContent = parseFloat(response.balance || 0).toFixed(2);
        document.getElementById('availableFunds').textContent = parseFloat(response.totalEarnings || 0).toFixed(2); // Only quantification earnings
        document.getElementById('unreleased').textContent = '0.00'; // Placeholder
        document.getElementById('totalIncome').textContent = parseFloat(response.totalEarnings || 0).toFixed(2);
        document.getElementById('todayIncome').textContent = parseFloat(response.todayEarnings || 0).toFixed(2);
        document.getElementById('yesterdayIncome').textContent = '0.00'; // Placeholder
        document.getElementById('monthIncome').textContent = parseFloat(response.todayEarnings || 0).toFixed(2); // Simplified
        document.getElementById('todayCommission').textContent = '0.00'; // Placeholder
        document.getElementById('yesterdayCommission').textContent = '0.00'; // Placeholder
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load click data
async function loadClickData() {
    try {
        const response = await api.get('/dashboard/clicks');
        
        // Update clicks left
        const clicksLeft = response.maxClicks - response.clicksUsed;
        document.getElementById('clicksLeft').textContent = clicksLeft;
        
        // Update click counters in button
        document.getElementById('clicksUsedDisplay').textContent = response.clicksUsed;
        document.getElementById('maxClicksDisplay').textContent = response.maxClicks;
        
        // Update current balance
        document.getElementById('currentBalance').textContent = parseFloat(response.currentBalance || 0).toFixed(2) + ' USD';
        
        // Update today's earnings
        document.getElementById('todayEarnings').textContent = parseFloat(response.todayEarnings || 0).toFixed(2) + ' USD';
        
        // Update button state
        const clickBtn = document.getElementById('clickToEarnBtn');
        if (clicksLeft <= 0) {
            clickBtn.disabled = true;
        } else {
            clickBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Error loading click data:', error);
    }
}

// Perform click with animation
async function performClick() {
    const clickBtn = document.getElementById('clickToEarnBtn');
    
    // Disable button
    clickBtn.disabled = true;
    
    // Create loading overlay
    const overlay = createLoadingOverlay();
    document.body.appendChild(overlay);
    
    const steps = [
        { text: 'Quantify bot startup success', delay: 1800 },
        { text: 'Successfully scanned the market', delay: 2500 },
        { text: 'Order matched successfully', delay: 2200 },
        { text: 'ExistGateSuccessful purchase', delay: 2400 },
        { text: 'ExistHuobiGlobalSold successfully', delay: 2300 },
        { text: 'System settlement completed', delay: 1900 },
        { text: 'Income distribution', delay: 1500, isLoading: true }
    ];
    
    try {
        // Show loading steps one by one
        await showLoadingSteps(steps);
        
        // Make actual API call
        const response = await api.post('/dashboard/click');
        
        // Show completion message
        await showCompletionMessage(response);
        
        // Wait 3 seconds before closing
        await sleep(3000);
        
        // Remove overlay
        document.body.removeChild(overlay);
        
        // Reload data
        await loadStatistics();
        await loadClickData();
        await loadClickHistory();
        
    } catch (error) {
        document.body.removeChild(overlay);
        alert('Error: ' + error.message);
        clickBtn.disabled = false;
    }
}

// Create loading overlay
function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'quantificationOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
        border: 2px solid rgba(102, 126, 234, 0.3);
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    // Title
    const title = document.createElement('div');
    title.style.cssText = `
        text-align: center;
        margin-bottom: 30px;
    `;
    title.innerHTML = `
        <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; animation: pulse 2s infinite;">
            💎
        </div>
        <h2 style="color: #667eea; font-size: 24px; margin: 0;">Quantifying...</h2>
    `;
    
    // Steps container
    const stepsContainer = document.createElement('div');
    stepsContainer.id = 'stepsContainer';
    stepsContainer.style.cssText = `
        margin-top: 30px;
    `;
    
    container.appendChild(title);
    container.appendChild(stepsContainer);
    overlay.appendChild(container);
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    return overlay;
}

// Show loading steps
async function showLoadingSteps(steps) {
    const container = document.getElementById('stepsContainer');
    
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        const stepDiv = document.createElement('div');
        stepDiv.style.cssText = `
            display: flex;
            align-items: center;
            padding: 12px 15px;
            margin-bottom: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            animation: slideIn 0.3s ease-out;
        `;
        
        const icon = document.createElement('div');
        icon.style.cssText = `
            width: 24px;
            height: 24px;
            margin-right: 15px;
            flex-shrink: 0;
        `;
        
        if (step.isLoading) {
            icon.innerHTML = '<div style="width: 20px; height: 20px; border: 3px solid rgba(102, 126, 234, 0.3); border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>';
        } else {
            icon.innerHTML = '<div style="width: 8px; height: 8px; background: #667eea; border-radius: 50%; margin: 8px;"></div>';
        }
        
        const text = document.createElement('div');
        text.style.cssText = `
            color: ${step.isLoading ? 'rgba(255, 255, 255, 0.6)' : '#fff'};
            font-size: 15px;
            flex: 1;
        `;
        text.textContent = step.text;
        
        stepDiv.appendChild(icon);
        stepDiv.appendChild(text);
        container.appendChild(stepDiv);
        
        await sleep(step.delay);
    }
}

// Show completion message
async function showCompletionMessage(response) {
    const container = document.getElementById('stepsContainer');
    
    // Update last step to completed
    const lastStep = container.lastChild;
    if (lastStep) {
        lastStep.querySelector('div').innerHTML = '<div style="width: 8px; height: 8px; background: #34c759; border-radius: 50%; margin: 8px;"></div>';
        lastStep.querySelector('div:last-child').style.color = '#fff';
    }
    
    await sleep(300);
    
    // Add completion message
    const completionDiv = document.createElement('div');
    completionDiv.style.cssText = `
        margin-top: 20px;
        padding: 20px;
        background: linear-gradient(135deg, rgba(52, 199, 89, 0.2) 0%, rgba(48, 209, 88, 0.1) 100%);
        border: 2px solid rgba(52, 199, 89, 0.5);
        border-radius: 15px;
        text-align: center;
        animation: slideIn 0.4s ease-out;
    `;
    
    completionDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
        <h3 style="color: #34c759; font-size: 20px; margin: 0 0 15px 0;">Quantification Completed!</h3>
        <div style="font-size: 16px; color: #fff; margin-bottom: 10px;">
            <strong>Earned: +${response.earned.toFixed(2)} USDT</strong>
        </div>
        <div style="font-size: 14px; color: rgba(255,255,255,0.7);">
            New Balance: ${response.newBalance.toFixed(2)} USDT
        </div>
    `;
    
    container.appendChild(completionDiv);
}

// Sleep helper function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Load click history
async function loadClickHistory() {
    try {
        const response = await api.get('/dashboard/click-history');
        const historyDiv = document.getElementById('clickHistory');
        
        if (!response.history || response.history.length === 0) {
            historyDiv.innerHTML = '<p class="no-data">No clicks yet today. Start earning!</p>';
            return;
        }
        
        // Build history HTML
        let html = '';
        response.history.forEach(click => {
            const date = new Date(click.created_at);
            const timeStr = date.toLocaleTimeString();
            
            html += `
                <div class="history-item">
                    <div class="history-left">
                        <div class="history-icon">💰</div>
                        <div class="history-details">
                            <h4>Daily Click Reward</h4>
                            <p>${timeStr} • ${click.percentage}% return</p>
                        </div>
                    </div>
                    <div class="history-amount">+${parseFloat(click.amount).toFixed(2)} USDT</div>
                </div>
            `;
        });
        
        historyDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading click history:', error);
    }
}

// Countdown timer
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const countdownStr = `${hours}h ${minutes}m ${seconds}s`;
        document.getElementById('resetCountdown').textContent = countdownStr;
        
        const resetTimeStr = tomorrow.toLocaleTimeString();
        document.getElementById('resetTime').textContent = resetTimeStr;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ============================================
// USER QUANTIFICATION LIVE FEED (FROM DEMO)
// ============================================

// Tab Switching
function switchQuantTab(tab) {
    if (tab === 'user') {
        document.getElementById('userTab').classList.add('active');
        document.getElementById('teamTab').classList.remove('active');
        document.getElementById('userQuantContent').style.display = 'block';
        document.getElementById('teamQuantContent').style.display = 'none';
    } else {
        document.getElementById('teamTab').classList.add('active');
        document.getElementById('userTab').classList.remove('active');
        document.getElementById('teamQuantContent').style.display = 'block';
        document.getElementById('userQuantContent').style.display = 'none';
    }
}

// Generate random email (international)
function generateRandomEmail() {
    const domains = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'proton.me', 'icloud.com', 'mail.com',
        'yandex.ru', 'mail.ru', 'rambler.ru', 'qq.com', '163.com', 'web.de', 'gmx.de', 't-online.de',
        'orange.fr', 'laposte.net', 'live.com', 'aol.com', 'zoho.com', 'tutanota.com', 'fastmail.com'
    ];
    
    const firstNames = [
        'john', 'mike', 'sarah', 'emma', 'alex', 'chris', 'david', 'lisa', 'tom', 'anna',
        'james', 'maria', 'robert', 'linda', 'kevin', 'jessica', 'daniel', 'emily',
        'dmitri', 'ivan', 'natasha', 'olga', 'vladimir', 'sergei', 'anastasia', 'boris',
        'pierre', 'marie', 'jean', 'sophie', 'lucas', 'julia', 'marco', 'sophia',
        'hans', 'klaus', 'petra', 'sabine', 'chen', 'wei', 'li', 'wang', 'ming',
        'carlos', 'jose', 'miguel', 'ana', 'luis', 'ricardo', 'andrea', 'pablo'
    ];
    
    const lastNames = [
        'smith', 'johnson', 'brown', 'taylor', 'anderson', 'thomas', 'jackson', 'white',
        'petrov', 'ivanov', 'volkov', 'sokolov', 'kozlov', 'morozov', 'novikov',
        'mueller', 'schmidt', 'schneider', 'fischer', 'weber', 'meyer', 'wagner',
        'garcia', 'martinez', 'rodriguez', 'lopez', 'gonzalez', 'fernandez', 'sanchez',
        'chen', 'wang', 'li', 'zhang', 'liu', 'yang', 'huang',
        'dupont', 'martin', 'bernard', 'dubois', 'moreau', 'laurent', 'simon'
    ];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    return `${firstName}.${lastName}@${domain}`;
}

// Blur email for privacy
function blurEmail(email) {
    const parts = email.split('@');
    const username = parts[0];
    const domain = parts[1];
    
    const visibleStart = username.substring(0, 2);
    const visibleEnd = username.substring(username.length - 2);
    const blurredMiddle = '*'.repeat(Math.max(username.length - 4, 3));
    
    return `${visibleStart}${blurredMiddle}${visibleEnd}@${domain}`;
}

// Get crypto logo SVG
function getCryptoLogo(crypto) {
    const logos = {
        'USDT': '<svg class="crypto-logo" style="width:18px;height:18px;margin-left:4px;vertical-align:middle;" viewBox="0 0 2000 2000"><path d="M1000,0c552.26,0,1000,447.74,1000,1000S1552.24,2000,1000,2000,0,1552.38,0,1000,447.68,0,1000,0" fill="#53ae94"/><path d="M1123.42,866.76V718H1463.6V491.34H537.28V718H877.5V866.64C601,879.34,393.1,934.1,393.1,999.7s208,120.36,484.4,133.14v476.5h246V1132.8c276.7-12.7,484.76-67.46,484.76-133.1S1400.16,879.34,1123.42,866.76ZM1000,1087.36c-272.6,0-493.3-42.9-493.3-95.66S727.4,896,1000,896s493.37,43,493.37,95.7S1272.62,1087.36,1000,1087.36Z" fill="#fff"/></svg>',
        'ETH': '<svg class="crypto-logo" style="width:18px;height:18px;margin-left:4px;vertical-align:middle;" viewBox="0 0 256 417"><path fill="#627eea" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/><path fill="#627eea" d="M127.962 0L0 212.32l127.962 75.639V154.158z" opacity=".6"/></svg>',
        'BTC': '<svg class="crypto-logo" style="width:18px;height:18px;margin-left:4px;vertical-align:middle;" viewBox="0 0 32 32"><g fill="none"><circle cx="16" cy="16" r="16" fill="#f7931a"/><path fill="#fff" d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"/></g></svg>',
        'SOL': '<svg class="crypto-logo" style="width:18px;height:18px;margin-left:4px;vertical-align:middle;" viewBox="0 0 397.7 311.7"><defs><linearGradient id="a" x1="360.88" y1="351.46" x2="-264.96" y2="-261.39" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#00ffa3"/><stop offset="1" stop-color="#dc1fff"/></linearGradient></defs><path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1z" fill="url(#a)"/><path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1z" fill="url(#a)"/><path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1z" fill="url(#a)"/></svg>'
    };
    return logos[crypto] || '';
}

// Generate random income
function generateRandomIncome() {
    const cryptos = ['USDT', 'ETH', 'BTC', 'SOL'];
    const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
    let amount;
    
    switch(crypto) {
        case 'USDT':
            amount = (Math.random() * 180 + 3).toFixed(2);
            break;
        case 'ETH':
            amount = (Math.random() * 0.045 + 0.001).toFixed(4);
            break;
        case 'BTC':
            amount = (Math.random() * 0.0016 + 0.00004).toFixed(5);
            break;
        case 'SOL':
            amount = (Math.random() * 0.95 + 0.02).toFixed(3);
            break;
    }
    
    return { amount, crypto };
}

// Add new user to table
function addUserQuantification() {
    const table = document.getElementById('quantFeedTable');
    if (!table) return;
    
    const email = generateRandomEmail();
    const income = generateRandomIncome();
    
    const row = document.createElement('tr');
    row.className = 'new-row';
    row.innerHTML = `
        <td>${blurEmail(email)}</td>
        <td>
            <span style="font-weight: 600;">${income.amount}</span>
            ${getCryptoLogo(income.crypto)}
        </td>
        <td><span style="background: rgba(52, 199, 89, 0.2); color: #34c759; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase;">Quantify success</span></td>
    `;
    
    // Add to top
    if (table.firstChild) {
        table.insertBefore(row, table.firstChild);
    } else {
        table.appendChild(row);
    }
    
    // Keep only last 8 entries
    while (table.children.length > 8) {
        table.removeChild(table.lastChild);
    }
}

// Start live feed
function startQuantificationFeed() {
    // Add initial entry
    setTimeout(() => addUserQuantification(), 500);
    
    // Add new entries at random intervals (3-8 seconds)
    function scheduleNext() {
        const delay = Math.random() * 5000 + 3000;
        setTimeout(() => {
            addUserQuantification();
            scheduleNext();
        }, delay);
    }
    scheduleNext();
}

// Start feed when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startQuantificationFeed);
} else {
    startQuantificationFeed();
}

