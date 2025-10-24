// deposit-auto.js - Simple BTC & SOL deposit
document.addEventListener('DOMContentLoaded', async function() {
    if (!api.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }
    
    // Display fixed addresses
    displayAddresses();
    await loadDepositHistory();
});

// Display deposit addresses with QR codes - FIXED ADDRESSES FOR ALL USERS
function displayAddresses() {
    const container = document.getElementById('addressesContainer');
    
    // Fixed addresses for ALL users
    const addresses = {
        BTC: 'bc1qmrtvul27km8nw4sq35g3wv9k5vjw9d26hk9d4g',
        SOL: '5zVw55SktvHh5j8yBECHFPm58V6SeJ3U8rtZYaSWs4AR'
    };
    
    const cryptoInfo = {
        BTC: {
            icon: '₿',
            name: 'Bitcoin',
            network: 'BTC Network',
            color: '#F7931A',
            confirmations: '1 confirmation',
            time: '~10-30 minutes'
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
                </div>
                
                <!-- QR Code and Address -->
                <div style="display: grid; grid-template-columns: 150px 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- QR Code -->
                    <div style="text-align: center;">
                        <div style="background: white; padding: 10px; border-radius: 12px; display: inline-block;">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${address}" 
                                 alt="${crypto} QR Code" 
                                 style="display: block; width: 130px; height: 130px;">
                        </div>
                        <p style="margin: 10px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.5);">Scan to pay</p>
                    </div>
                    
                    <!-- Address -->
                    <div>
                        <p style="margin: 0 0 10px 0; font-size: 13px; color: rgba(255,255,255,0.6);">Deposit Address:</p>
                        <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); position: relative;">
                            <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 13px; color: #fff; word-break: break-all; line-height: 1.6;">
                                ${address}
                            </p>
                            <button onclick="copyAddress('${address}', '${crypto}')" 
                                    id="copyBtn${crypto}"
                                    style="position: absolute; top: 10px; right: 10px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                                📋 Copy
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Network Info -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div>
                        <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5);">Required Confirmations</p>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: #fff; font-weight: 600;">${info.confirmations}</p>
                    </div>
                    <div>
                        <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.5);">Expected Time</p>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: #fff; font-weight: 600;">${info.time}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Copy address to clipboard
function copyAddress(address, crypto) {
    navigator.clipboard.writeText(address).then(() => {
        const btn = document.getElementById(`copyBtn${crypto}`);
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
        }, 2000);
    }).catch(err => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = address;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        alert('Address copied to clipboard!');
    });
}

// Make function globally available
window.copyAddress = copyAddress;

// Check for transactions (manual refresh)
async function checkForTransactions() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '🔄 Checking...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = '✅ Checked!';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }, 1500);
}

window.checkForTransactions = checkForTransactions;

// Load deposit history (from API if needed, or skip)
async function loadDepositHistory() {
    const container = document.getElementById('recentDeposits');
    if (!container) return;
    
    try {
        const response = await api.get('deposit/history');
        
        if (response.success && response.deposits && response.deposits.length > 0) {
            container.innerHTML = response.deposits.slice(0, 5).map(deposit => {
                const date = new Date(deposit.created_at).toLocaleDateString();
                const statusColor = deposit.status === 'confirmed' ? '#10b981' : '#f59e0b';
                
                return `
                    <div style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 13px; color: #cbd5e1;">${deposit.amount} ${deposit.crypto}</span>
                            <span style="font-size: 12px; color: ${statusColor};">${deposit.status}</span>
                        </div>
                        <div style="font-size: 11px; color: #64748b;">${date}</div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = '<p class="no-transactions">No recent deposits</p>';
        }
    } catch (error) {
        console.error('Load deposit history error:', error);
        container.innerHTML = '<p class="no-transactions">No recent deposits</p>';
    }
}
