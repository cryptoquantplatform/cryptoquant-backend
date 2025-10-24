// Deposit JavaScript

let selectedCrypto = 'usdt';
let depositAmount = 0;

// Initialize deposit page
function initDeposit() {
    setupCryptoSelector();
    setupAmountInput();
    updateDepositInfo();
}

// Setup crypto selector
function setupCryptoSelector() {
    const cryptoOptions = document.querySelectorAll('.crypto-option');
    
    cryptoOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all
            cryptoOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked
            this.classList.add('selected');
            
            // Update selected crypto
            selectedCrypto = this.dataset.crypto;
            updateDepositInfo();
        });
    });
}

// Setup amount input
function setupAmountInput() {
    const amountInput = document.getElementById('depositAmount');
    
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            depositAmount = parseFloat(this.value) || 0;
            validateAmount();
        });
    }
}

// Set quick amount
function setAmount(amount) {
    const amountInput = document.getElementById('depositAmount');
    if (amountInput) {
        amountInput.value = amount;
        depositAmount = amount;
        validateAmount();
    }
}

// Validate amount
function validateAmount() {
    const amountInput = document.getElementById('depositAmount');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (depositAmount < 75) {
        amountInput.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        }
    } else {
        amountInput.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }
}

// Update deposit information
function updateDepositInfo() {
    const cryptoNames = {
        'usdt': 'USDT (TRC20)',
        'btc': 'Bitcoin',
        'eth': 'Ethereum (ERC20)'
    };
    
    const walletAddresses = {
        'usdt': 'TYourWalletAddressHere123456789',
        'btc': '1YourBTCWalletAddressHere123456789',
        'eth': '0xYourETHWalletAddressHere123456789'
    };
    
    // Update selected crypto displays
    const selectedCryptoElements = document.querySelectorAll('#selectedCrypto, #cryptoType');
    selectedCryptoElements.forEach(el => {
        if (el) el.textContent = cryptoNames[selectedCrypto];
    });
    
    // Update wallet address
    const walletAddressInput = document.getElementById('walletAddress');
    if (walletAddressInput) {
        walletAddressInput.value = walletAddresses[selectedCrypto];
    }
    
    // Update QR code
    const qrImage = document.querySelector('.qr-code img');
    if (qrImage) {
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddresses[selectedCrypto]}`;
    }
    
    // Update currency label
    const currencyLabel = document.getElementById('currencyLabel');
    if (currencyLabel) {
        currencyLabel.textContent = selectedCrypto.toUpperCase();
    }
}

// Copy wallet address
function copyAddress() {
    const walletAddressInput = document.getElementById('walletAddress');
    if (walletAddressInput) {
        walletAddressInput.select();
        document.execCommand('copy');
        
        // Show copied message
        const copyBtn = document.querySelector('.address-box .copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        }, 2000);
    }
}

// Confirm deposit
function confirmDeposit() {
    if (depositAmount < 75) {
        alert('Minimum deposit amount is 75€. Please enter a valid amount.');
        return;
    }
    
    // Show confirmation dialog
    if (confirm(`Confirm deposit of ${depositAmount} ${selectedCrypto.toUpperCase()}?`)) {
        // In real app, this would verify the transaction on blockchain
        // For demo, we'll simulate adding to balance
        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            userData.balance += depositAmount;
            localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        // Add to transaction history
        addDepositToHistory(depositAmount, selectedCrypto);
        
        // Show success message
        alert('Deposit confirmed! Your balance will be updated after network confirmation (5-15 minutes).');
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Add deposit to history
function addDepositToHistory(amount, crypto) {
    let history = JSON.parse(localStorage.getItem('depositHistory') || '[]');
    
    history.unshift({
        amount: amount,
        crypto: crypto.toUpperCase(),
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    
    // Keep last 20 transactions
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    localStorage.setItem('depositHistory', JSON.stringify(history));
}

// Load recent deposits
function loadRecentDeposits() {
    const history = JSON.parse(localStorage.getItem('depositHistory') || '[]');
    const container = document.getElementById('recentDeposits');
    
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = '<p class="no-transactions">No recent deposits</p>';
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

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    initDeposit();
    loadRecentDeposits();
});

// Make functions globally available
window.setAmount = setAmount;
window.copyAddress = copyAddress;
window.confirmDeposit = confirmDeposit;



