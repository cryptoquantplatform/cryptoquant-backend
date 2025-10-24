// Withdraw JavaScript

let selectedCrypto = 'usdt';
let withdrawAmount = 0;
const networkFee = 1; // USDT

// Initialize withdraw page
function initWithdraw() {
    loadUserBalance();
    setupCryptoSelector();
    setupAmountInput();
    updateWithdrawInfo();
    loadRecentWithdrawals();
}

// Load user balance
async function loadUserBalance() {
    try {
        const response = await fetch(API_BASE_URL + '/dashboard', {
            headers: {
                'Authorization': 'Bearer ' + (localStorage.getItem('token') || sessionStorage.getItem('token'))
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const balance = parseFloat(data.balance || 0);
            
            // Update localStorage
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            userData.balance = balance;
            localStorage.setItem('userData', JSON.stringify(userData));
            
            const balanceElement = document.getElementById('availableBalance');
            if (balanceElement) {
                balanceElement.textContent = balance.toFixed(2) + ' USD';
            }
        }
    } catch (error) {
        console.error('Error loading balance:', error);
        // Fallback to localStorage
        const userData = JSON.parse(localStorage.getItem('userData'));
        const balance = userData ? userData.balance : 0;
        
        const balanceElement = document.getElementById('availableBalance');
        if (balanceElement) {
            balanceElement.textContent = balance.toFixed(2) + ' USD';
        }
    }
}

// Setup crypto selector
function setupCryptoSelector() {
    const cryptoOptions = document.querySelectorAll('.crypto-option');
    
    cryptoOptions.forEach(option => {
        option.addEventListener('click', function() {
            cryptoOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedCrypto = this.dataset.crypto;
            updateWithdrawInfo();
        });
    });
}

// Setup amount input
function setupAmountInput() {
    const amountInput = document.getElementById('withdrawAmount');
    
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            withdrawAmount = parseFloat(this.value) || 0;
            updateAmountDisplay();
            validateWithdrawAmount();
        });
    }
}

// Update amount display
function updateAmountDisplay() {
    document.getElementById('withdrawAmountDisplay').textContent = withdrawAmount.toFixed(2) + ' USD';
    document.getElementById('networkFee').textContent = networkFee.toFixed(2) + ' USD';
    
    const finalAmount = Math.max(0, withdrawAmount - networkFee);
    document.getElementById('finalAmount').textContent = finalAmount.toFixed(2) + ' USD';
}

// Validate withdraw amount
function validateWithdrawAmount() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const balance = userData ? userData.balance : 0;
    const amountInput = document.getElementById('withdrawAmount');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (withdrawAmount < 10) {
        amountInput.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        if (submitBtn) submitBtn.disabled = true;
    } else if (withdrawAmount > balance) {
        amountInput.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        if (submitBtn) submitBtn.disabled = true;
    } else {
        amountInput.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Set maximum amount
function setMaxAmount() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const balance = userData ? userData.balance : 0;
    
    const amountInput = document.getElementById('withdrawAmount');
    if (amountInput) {
        amountInput.value = balance;
        withdrawAmount = balance;
        updateAmountDisplay();
        validateWithdrawAmount();
    }
}

// Update withdraw information
function updateWithdrawInfo() {
    const cryptoNames = {
        'usdt': 'USDT (TRC20)',
        'btc': 'Bitcoin',
        'eth': 'Ethereum (ERC20)',
        'sol': 'Solana'
    };
    
    const cryptoNetworkElement = document.getElementById('cryptoNetwork');
    if (cryptoNetworkElement) {
        cryptoNetworkElement.textContent = cryptoNames[selectedCrypto];
    }
}

// Submit withdrawal
async function submitWithdrawal() {
    const walletAddress = document.getElementById('walletAddress').value;
    const userData = JSON.parse(localStorage.getItem('userData'));
    const balance = userData ? userData.balance : 0;
    
    // Validate
    if (!walletAddress) {
        alert('Please enter your wallet address');
        return;
    }
    
    if (withdrawAmount < 10) {
        alert('Minimum withdrawal amount is 10 USD');
        return;
    }
    
    if (withdrawAmount > balance) {
        alert('Insufficient balance');
        return;
    }
    
    // Confirm withdrawal
    const finalAmountUSD = withdrawAmount - networkFee;
    if (confirm(`Confirm withdrawal?\n\n💵 USD Amount: $${finalAmountUSD.toFixed(2)}\n🪙 Crypto: ${selectedCrypto.toUpperCase()}\n📮 To: ${walletAddress}\n💸 Network Fee: $${networkFee.toFixed(2)}\n\n⚠️ Your balance will be converted to ${selectedCrypto.toUpperCase()} at current market rate.`)) {
        try {
            const response = await fetch(API_BASE_URL + '/withdrawal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (localStorage.getItem('token') || sessionStorage.getItem('token'))
                },
                body: JSON.stringify({
                    crypto: selectedCrypto.toUpperCase(),
                    amount: withdrawAmount,
                    walletAddress: walletAddress
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Get user data for email instructions
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                const username = userData.full_name || 'User';
                
                // Show email instructions modal
                showEmailInstructionsModal(username, data.withdrawalId, finalAmountUSD, selectedCrypto.toUpperCase(), walletAddress);
                
                // Reload balance
                await loadUserBalance();
                loadRecentWithdrawals();
                
                // Reset form
                document.getElementById('withdrawAmount').value = '';
                document.getElementById('walletAddress').value = '';
                withdrawAmount = 0;
                updateAmountDisplay();
            } else {
                alert('❌ Error: ' + data.message);
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            alert('❌ Error submitting withdrawal. Please try again.');
        }
    }
}

// Add withdrawal to history
function addWithdrawalToHistory(amount, crypto, address) {
    let history = JSON.parse(localStorage.getItem('withdrawalHistory') || '[]');
    
    history.unshift({
        amount: amount,
        crypto: crypto.toUpperCase(),
        address: address,
        status: 'processing',
        timestamp: new Date().toISOString()
    });
    
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    localStorage.setItem('withdrawalHistory', JSON.stringify(history));
}

// Load recent withdrawals
function loadRecentWithdrawals() {
    const history = JSON.parse(localStorage.getItem('withdrawalHistory') || '[]');
    const container = document.getElementById('recentWithdrawals');
    
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = '<p class="no-transactions">No recent withdrawals</p>';
        return;
    }
    
    container.innerHTML = history.slice(0, 5).map(tx => {
        const date = new Date(tx.timestamp).toLocaleString();
        const statusColor = tx.status === 'completed' ? '#10b981' : '#f59e0b';
        
        return `
            <div style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 13px; color: #cbd5e1;">${tx.amount} ${tx.crypto}</span>
                    <span style="font-size: 12px; color: ${statusColor};">${tx.status}</span>
                </div>
                <div style="font-size: 11px; color: #64748b;">${date}</div>
            </div>
        `;
    }).join('');
}

// Show email instructions modal
function showEmailInstructionsModal(username, withdrawalId, amount, crypto, address) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(8px);
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border-radius: 20px;
        padding: 40px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        border: 2px solid rgba(94, 92, 230, 0.3);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;
    
    modal.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #34c759 0%, #10b981 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                ✓
            </div>
            <h2 style="color: #34c759; font-size: 28px; margin: 0 0 10px 0;">Withdrawal Submitted!</h2>
            <p style="color: rgba(255,255,255,0.6); margin: 0;">Withdrawal ID: <strong>#${withdrawalId}</strong></p>
        </div>
        
        <div style="background: rgba(255, 204, 0, 0.1); border: 2px solid rgba(255, 204, 0, 0.3); border-radius: 15px; padding: 25px; margin-bottom: 25px;">
            <h3 style="color: #ffcc00; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">📧</span>
                IMPORTANT - Next Step Required
            </h3>
            <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0; line-height: 1.6;">
                To process your withdrawal, please send a confirmation email to:
            </p>
            
            <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; margin-bottom: 20px; border: 1px solid rgba(94, 92, 230, 0.3);">
                <div style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">Email Address:</div>
                <div style="font-size: 18px; color: #5e5ce6; font-weight: 600; word-break: break-all;">
                    cryptoquantplatform@gmail.com
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">📋 Email Template:</div>
                <div style="font-size: 13px; color: #e2e8f0; line-height: 1.8; font-family: monospace;">
                    <div style="margin-bottom: 10px;"><strong>Subject:</strong> Withdrawal Request - ${username}</div>
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                        <div>Username: <strong>${username}</strong></div>
                        <div>Withdrawal ID: <strong>#${withdrawalId}</strong></div>
                        <div>Amount: <strong>$${amount.toFixed(2)} USD</strong></div>
                        <div>Crypto: <strong>${crypto}</strong></div>
                        <div>Address: <strong style="word-break: break-all;">${address}</strong></div>
                        <div style="margin-top: 10px;">I request approval for my withdrawal.</div>
                    </div>
                </div>
            </div>
            
            <button onclick="copyEmailTemplate('${username}', '${withdrawalId}', '${amount.toFixed(2)}', '${crypto}', '${address}')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #5e5ce6 0%, #4338ca 100%); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; font-size: 14px; margin-bottom: 10px;">
                📋 Copy Email Template
            </button>
            
            <a href="mailto:cryptoquantplatform@gmail.com?subject=Withdrawal%20Request%20-%20${encodeURIComponent(username)}&body=Username:%20${encodeURIComponent(username)}%0AWithdrawal%20ID:%20%23${withdrawalId}%0AAmount:%20$${amount.toFixed(2)}%20USD%0ACrypto:%20${crypto}%0AAddress:%20${encodeURIComponent(address)}%0A%0AI%20request%20approval%20for%20my%20withdrawal." style="display: block; width: 100%; padding: 12px; background: rgba(52, 199, 89, 0.2); border: 1px solid rgba(52, 199, 89, 0.5); border-radius: 10px; color: #34c759; font-weight: 600; cursor: pointer; font-size: 14px; text-decoration: none; text-align: center;">
                ✉️ Open Email App
            </a>
        </div>
        
        <div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 15px; margin-bottom: 20px;">
            <div style="font-size: 12px; color: #60a5fa; margin-bottom: 8px;">⏳ Processing Time:</div>
            <div style="color: rgba(255,255,255,0.8); font-size: 14px;">
                Your withdrawal will be processed within 24-48 hours after email verification.
            </div>
        </div>
        
        <button onclick="this.closest('[style*=fixed]').remove()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #5e5ce6 0%, #4338ca 100%); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; font-size: 16px;">
            I Understand - Close
        </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Copy email template to clipboard
window.copyEmailTemplate = function(username, withdrawalId, amount, crypto, address) {
    const template = `Subject: Withdrawal Request - ${username}

Username: ${username}
Withdrawal ID: #${withdrawalId}
Amount: $${amount} USD
Crypto: ${crypto}
Address: ${address}

I request approval for my withdrawal.`;
    
    navigator.clipboard.writeText(template).then(() => {
        alert('✅ Email template copied to clipboard!');
    }).catch(() => {
        alert('❌ Could not copy to clipboard. Please copy manually.');
    });
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', initWithdraw);

// Make functions globally available
window.setMaxAmount = setMaxAmount;
window.submitWithdrawal = submitWithdrawal;


