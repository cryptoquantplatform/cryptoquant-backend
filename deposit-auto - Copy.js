// deposit-auto.js
document.addEventListener('DOMContentLoaded', async function() {
    if (!api.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    await loadDepositAddresses(); // Loads addresses + pending transactions
    await loadDepositHistory();
});

// Load deposit addresses
async function loadDepositAddresses() {
    try {
        const response = await api.get('deposit-addresses');
        
        if (!response.success) {
            throw new Error(response.message);
        }

        const { addresses, balances, pendingTransactions } = response;
        
        // Display addresses with QR codes
        displayAddresses(addresses, balances);
        
        // Display pending transactions if any
        if (pendingTransactions && pendingTransactions.length > 0) {
            displayPendingTransactions(pendingTransactions);
        }
        
    } catch (error) {
        console.error('Load addresses error:', error);
        document.getElementById('addressesContainer').innerHTML = `
            <p style="color: #ff3b30; text-align: center; padding: 20px;">
                Error loading deposit addresses: ${error.message}
            </p>
        `;
    }
}

// Display deposit addresses with QR codes
function displayAddresses(addresses, balances) {
    const container = document.getElementById('addressesContainer');
    
    const cryptoInfo = {
        ETH: {
            icon: 'Ξ',
            name: 'Ethereum',
            network: 'ERC-20',
            color: '#627EEA',
            confirmations: '12 confirmations',
            time: '~3 minutes'
        },
        USDT: {
            icon: '₮',
            name: 'USDT',
            network: 'ERC-20 (Ethereum)',
            color: '#26A17B',
            confirmations: '12 confirmations',
            time: '~3 minutes'
        },
        BTC: {
            icon: '₿',
            name: 'Bitcoin',
            network: 'BTC Network',
            color: '#F7931A',
            confirmations: '3 confirmations',
            time: '~30 minutes'
        },
        SOL: {
            icon: '◎',
            name: 'Solana',
            network: 'Solana Network',
            color: '#14F195',
            confirmations: '1 confirmation',
            time: '~30 seconds'
        }
    };
    
    let html = '';
    
    for (const [crypto, address] of Object.entries(addresses)) {
        const info = cryptoInfo[crypto];
        const balance = balances[crypto] || '0';
        
        html += `
            <div class="crypto-address-card" style="background: rgba(255,255,255,0.03); border: 2px solid rgba(255,255,255,0.1); border-radius: 15px; padding: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 50px; height: 50px; background: ${info.color}22; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: ${info.color};">
                            ${info.icon}
                        </div>
                        <div>
                            <h3 style="margin: 0; font-size: 22px; color: ${info.color};">${info.name}</h3>
                            <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.6); font-size: 13px;">${info.network}</p>
                        </div>
                    </div>
                    ${parseFloat(balance) > 0 ? `
                        <div style="text-align: right;">
                            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.5);">On-chain Balance</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: #34c759;">${parseFloat(balance).toFixed(8)} ${crypto}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div style="display: grid; grid-template-columns: 150px 1fr; gap: 20px; margin: 20px 0;">
                    <div style="text-align: center;">
                        <div id="qr-${crypto}" style="background: white; padding: 10px; border-radius: 10px; display: inline-block;">
                            <p style="color: #666; font-size: 12px; margin: 0;">Loading QR...</p>
                        </div>
                        <p style="margin: 10px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.5);">Scan to send</p>
                    </div>
                    
                    <div>
                        <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8);">Your ${crypto} Deposit Address:</p>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" readonly value="${address}" id="address-${crypto}" 
                                   style="flex: 1; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; font-size: 13px; font-family: monospace;">
                            <button onclick="copyAddress('${crypto}', '${address}')" 
                                    style="padding: 12px 20px; background: ${info.color}33; border: 1px solid ${info.color}66; border-radius: 8px; color: ${info.color}; cursor: pointer; font-weight: 600; white-space: nowrap;">
                                📋 Copy
                            </button>
                        </div>
                        
                        <div style="margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; font-size: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: rgba(255,255,255,0.6);">⏱️ Processing Time:</span>
                                <span style="color: rgba(255,255,255,0.9); font-weight: 600;">${info.time}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: rgba(255,255,255,0.6);">✅ Required:</span>
                                <span style="color: rgba(255,255,255,0.9); font-weight: 600;">${info.confirmations}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Load QR codes
    for (const [crypto, address] of Object.entries(addresses)) {
        loadQRCode(crypto, address);
    }
}

// Load QR code for an address
async function loadQRCode(crypto, address) {
    try {
        // Use a simpler QR code API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(address)}&margin=0`;
        
        document.getElementById(`qr-${crypto}`).innerHTML = `
            <img src="${qrUrl}" alt="${crypto} QR Code" style="width: 130px; height: 130px; display: block;">
        `;
    } catch (error) {
        console.error(`Error loading QR for ${crypto}:`, error);
        document.getElementById(`qr-${crypto}`).innerHTML = `
            <p style="color: #666; font-size: 11px;">QR unavailable</p>
        `;
    }
}

// Display pending transactions
function displayPendingTransactions(transactions) {
    const card = document.getElementById('pendingTxCard');
    const container = document.getElementById('pendingTransactions');
    
    if (transactions.length === 0) {
        card.style.display = 'none';
        return;
    }
    
    card.style.display = 'block';
    
    let html = '<div style="display: grid; gap: 15px;">';
    
    transactions.forEach(tx => {
        const progress = Math.min(100, (tx.confirmations / tx.required_confirmations) * 100);
        
        html += `
            <div style="padding: 15px; background: rgba(0,0,0,0.2); border-radius: 10px; border: 1px solid rgba(255, 204, 0, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <strong style="color: #ffcc00; font-size: 16px;">${parseFloat(tx.amount).toFixed(8)} ${tx.crypto}</strong>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.6);">
                            TX: ${tx.tx_hash.slice(0, 10)}...${tx.tx_hash.slice(-8)}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #ffcc00;">
                            ${tx.confirmations}/${tx.required_confirmations}
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.5);">
                            confirmations
                        </p>
                    </div>
                </div>
                
                <div style="width: 100%; height: 6px; background: rgba(255, 204, 0, 0.2); border-radius: 3px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #ffcc00, #ff9500); transition: width 0.5s;"></div>
                </div>
                
                <p style="margin: 10px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.5); text-align: center;">
                    ${tx.confirmations >= tx.required_confirmations ? 
                        '✅ Confirmed! Crediting your balance...' : 
                        '⏳ Waiting for blockchain confirmations...'
                    }
                </p>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Copy address to clipboard
function copyAddress(crypto, address) {
    navigator.clipboard.writeText(address).then(() => {
        // Show feedback
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.style.background = 'rgba(52, 199, 89, 0.3)';
        btn.style.borderColor = 'rgba(52, 199, 89, 0.6)';
        btn.style.color = '#34c759';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy address. Please copy manually.');
    });
}

// Check for new transactions
async function checkForTransactions() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '🔄 Checking...';
    btn.disabled = true;
    
    try {
        const response = await api.post('deposit-addresses/check', {});
        
        if (response.success) {
            // Reload addresses and pending transactions
            await loadDepositAddresses();
            
            // Update user balance display if it exists
            if (response.balance) {
                const balanceElements = document.querySelectorAll('.balance-value, #userBalance');
                balanceElements.forEach(el => {
                    if (el) el.textContent = parseFloat(response.balance).toFixed(2) + ' USDT';
                });
            }
            
            btn.innerHTML = '✅ Checked!';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        }
        
    } catch (error) {
        console.error('Check transactions error:', error);
        btn.innerHTML = '❌ Error';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

// Load deposit history
async function loadDepositHistory() {
    try {
        const response = await api.get('deposit-history');
        
        if (!response.success || !response.deposits || response.deposits.length === 0) {
            document.getElementById('recentDeposits').innerHTML = '<p class="no-transactions">No recent deposits</p>';
            return;
        }
        
        let html = '';
        response.deposits.slice(0, 5).forEach(deposit => {
            const statusColor = deposit.status === 'approved' ? '#34c759' : '#ffcc00';
            const statusIcon = deposit.status === 'approved' ? '✅' : '⏳';
            
            html += `
                <div class="transaction-item" style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-weight: 600; color: ${statusColor};">${statusIcon} ${parseFloat(deposit.amount).toFixed(4)} ${deposit.crypto}</span>
                        <span style="font-size: 11px; color: rgba(255,255,255,0.5);">${new Date(deposit.created_at).toLocaleDateString()}</span>
                    </div>
                    ${deposit.tx_hash ? `
                        <p style="margin: 5px 0 0 0; font-size: 10px; color: rgba(255,255,255,0.4); font-family: monospace;">
                            TX: ${deposit.tx_hash.slice(0, 8)}...${deposit.tx_hash.slice(-6)}
                        </p>
                    ` : ''}
                </div>
            `;
        });
        
        document.getElementById('recentDeposits').innerHTML = html;
        
    } catch (error) {
        console.error('Load deposit history error:', error);
    }
}

// Auto-refresh pending transactions every 30 seconds
setInterval(async () => {
    try {
        const response = await api.get('deposit-addresses');
        if (response.success && response.pendingTransactions) {
            displayPendingTransactions(response.pendingTransactions);
            
            // If balance updated, refresh display
            if (response.pendingTransactions.length === 0) {
                loadDepositHistory();
            }
        }
    } catch (error) {
        console.log('Auto-refresh error:', error);
    }
}, 30000);

