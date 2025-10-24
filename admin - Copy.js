// Admin API Helper
const adminApi = {
    async call(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = 'admin-login.html';
            throw new Error('No admin token');
        }

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(API_BASE_URL + '/admin/' + endpoint, options);
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = 'admin-login.html';
            }
            throw new Error(result.message || 'Request failed');
        }

        return result;
    },

    get(endpoint) { return this.call(endpoint, 'GET'); },
    post(endpoint, data) { return this.call(endpoint, 'POST', data); },
    put(endpoint, data) { return this.call(endpoint, 'PUT', data); },
    delete(endpoint) { return this.call(endpoint, 'DELETE'); }
};

// Check auth
if (!localStorage.getItem('adminToken')) {
    window.location.href = 'admin-login.html';
}

// Display admin username
const adminUser = JSON.parse(localStorage.getItem('adminUser'));
document.getElementById('adminUsername').textContent = adminUser.username;

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Update active section
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${section}`).classList.add('active');
        
        // Load section data
        loadSectionData(section);
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = 'admin-login.html';
    }
});

// Load section data
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'users':
            loadUsers();
            break;
        case 'deposits':
            loadDeposits();
            break;
        case 'withdrawals':
            loadWithdrawals();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ============================================
// DASHBOARD
// ============================================

async function loadDashboardStats() {
    try {
        const data = await adminApi.get('dashboard-stats');
        const stats = data.stats;
        
        document.getElementById('stat-totalUsers').textContent = stats.totalUsers;
        document.getElementById('stat-activeUsers').textContent = stats.activeUsers;
        document.getElementById('stat-totalBalance').textContent = stats.totalBalance + ' USD';
        document.getElementById('stat-totalEarnings').textContent = stats.totalEarnings + ' USD';
        document.getElementById('stat-pendingDeposits').textContent = 
            `${stats.pendingDeposits.count} (${stats.pendingDeposits.total.toFixed(2)} USD)`;
        document.getElementById('stat-pendingWithdrawals').textContent = 
            `${stats.pendingWithdrawals.count} (${stats.pendingWithdrawals.total.toFixed(2)} USD)`;
        document.getElementById('stat-todayClicks').textContent = stats.todayClicks;
        document.getElementById('stat-totalReferrals').textContent = stats.totalReferrals;
        
    } catch (error) {
        console.error('Load stats error:', error);
        alert('Error loading statistics: ' + error.message);
    }
}

// ============================================
// USERS
// ============================================

let currentUsersPage = 1;
let currentUserSearch = '';

document.getElementById('userSearch').addEventListener('input', (e) => {
    currentUserSearch = e.target.value;
    currentUsersPage = 1;
    loadUsers();
});

async function loadUsers() {
    try {
        // Get realMoneyFilter checkbox value
        const realMoneyOnly = document.getElementById('realMoneyFilter')?.checked || false;
        
        const data = await adminApi.get(
            `users?page=${currentUsersPage}&limit=50&search=${currentUserSearch}&realMoneyOnly=${realMoneyOnly}`
        );
        
        const tbody = document.getElementById('usersTableBody');
        
        if (data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.users.map(user => {
            const realDeposits = parseFloat(user.real_deposits || 0);
            const hasRealMoney = realDeposits > 0;
            
            return `
            <tr>
                <td>${user.id}</td>
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td>
                    <span style="color: #34c759; font-weight: bold;">${parseFloat(user.balance).toFixed(2)} USDT</span>
                </td>
                <td>
                    ${hasRealMoney ? 
                        `<span style="color: #ffcc00; font-weight: bold;">💎 ${realDeposits.toFixed(2)} USDT</span>` : 
                        `<span style="color: rgba(255,255,255,0.3);">-</span>`
                    }
                </td>
                <td>Level ${user.level}</td>
                <td>${user.referral_count}</td>
                <td>
                    <span class="badge ${user.is_active ? 'badge-success' : 'badge-danger'}">
                        ${user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    ${user.email_verified ? '<span class="badge badge-info">Verified</span>' : ''}
                </td>
                <td>
                    <button class="btn-action btn-view" onclick="viewUser(${user.id})" title="View & Manage Balance">💰 View</button>
                    ${hasRealMoney ? 
                        `<button class="btn-action btn-approve" onclick="quickWithdrawCrypto(${user.id})" title="Withdraw Real Crypto">🏦 Withdraw</button>` : 
                        ''
                    }
                    <button class="btn-action ${user.is_active ? 'btn-disable' : 'btn-approve'}" 
                            onclick="toggleUserStatus(${user.id})">
                        ${user.is_active ? 'Disable' : 'Enable'}
                    </button>
                </td>
            </tr>
        `;
        }).join('');
        
        // Update pagination
        renderPagination('usersPagination', data.pagination.page, data.pagination.pages, (page) => {
            currentUsersPage = page;
            loadUsers();
        });
        
    } catch (error) {
        console.error('Load users error:', error);
        alert('Error loading users: ' + error.message);
    }
}

async function viewUser(userId) {
    try {
        const data = await adminApi.get(`users/${userId}`);
        const user = data.user;
        
        document.getElementById('modalUserName').textContent = user.full_name;
        document.getElementById('userInfo').innerHTML = `
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>💰 Current Balance:</strong> <span style="color: #34c759; font-size: 18px; font-weight: bold;">${parseFloat(user.balance).toFixed(2)} USDT</span></p>
            <p><strong>Total Earnings:</strong> ${parseFloat(user.total_earnings).toFixed(2)} USDT</p>
            <p><strong>Level:</strong> ${user.level}</p>
            <p><strong>Referral Code:</strong> ${user.referral_code}</p>
            <p><strong>Referred By:</strong> ${user.referred_by || 'None'}</p>
            <p><strong>Status:</strong> ${user.is_active ? 'Active' : 'Inactive'}</p>
            <p><strong>Email Verified:</strong> ${user.email_verified ? 'Yes' : 'No'}</p>
            <p><strong>Created:</strong> ${new Date(user.created_at).toLocaleString()}</p>
        `;
        
        document.getElementById('userActivity').innerHTML = `
            <h4>Referrals (${data.referrals.length})</h4>
            ${data.referrals.slice(0, 5).map(r => `
                <p>${r.full_name} - ${parseFloat(r.commission_earned).toFixed(2)} USDT commission</p>
            `).join('') || '<p>No referrals</p>'}
            
            <h4>Recent Deposits</h4>
            ${data.deposits.slice(0, 5).map(d => `
                <p>${parseFloat(d.amount).toFixed(2)} ${d.crypto} - ${d.status} - ${new Date(d.created_at).toLocaleDateString()}</p>
            `).join('') || '<p>No deposits</p>'}
            
            <h4>Recent Clicks</h4>
            ${data.clickHistory.slice(0, 5).map(c => `
                <p>+${parseFloat(c.amount).toFixed(2)} USDT (${c.percentage}%) - ${new Date(c.created_at).toLocaleString()}</p>
            `).join('') || '<p>No clicks</p>'}
        `;
        
        // Store current user ID for balance update
        window.currentUserId = userId;
        
        document.getElementById('userModal').style.display = 'block';
        
    } catch (error) {
        console.error('View user error:', error);
        alert('Error loading user details: ' + error.message);
    }
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('balanceAmount').value = '';
    document.getElementById('balanceReason').value = '';
}

// Quick Deposit Function
async function quickDeposit() {
    const amount = prompt('Enter amount to DEPOSIT to user wallet (USDT):');
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Please enter a valid positive amount');
        return;
    }
    
    const reason = prompt('Reason for deposit (optional):') || 'Admin deposit';
    
    if (!confirm(`💰 DEPOSIT ${parseFloat(amount).toFixed(2)} USDT to this user's wallet?`)) {
        return;
    }
    
    try {
        await adminApi.put(`users/${window.currentUserId}/balance`, { 
            amount: parseFloat(amount), 
            reason 
        });
        alert(`✅ Successfully deposited ${parseFloat(amount).toFixed(2)} USDT!`);
        viewUser(window.currentUserId);
        loadUsers();
        loadDashboardStats();
    } catch (error) {
        console.error('Deposit error:', error);
        alert('Error: ' + error.message);
    }
}

// Quick Withdraw Function
async function quickWithdraw() {
    const amount = prompt('Enter amount to WITHDRAW from user wallet (USDT):');
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Please enter a valid positive amount');
        return;
    }
    
    const reason = prompt('Reason for withdrawal (optional):') || 'Admin withdrawal';
    
    if (!confirm(`⚠️ WITHDRAW ${parseFloat(amount).toFixed(2)} USDT from this user's wallet?`)) {
        return;
    }
    
    try {
        await adminApi.put(`users/${window.currentUserId}/balance`, { 
            amount: -parseFloat(amount), 
            reason 
        });
        alert(`✅ Successfully withdrew ${parseFloat(amount).toFixed(2)} USDT!`);
        viewUser(window.currentUserId);
        loadUsers();
        loadDashboardStats();
    } catch (error) {
        console.error('Withdraw error:', error);
        alert('Error: ' + error.message);
    }
}

async function updateUserBalance() {
    const amount = parseFloat(document.getElementById('balanceAmount').value);
    const reason = document.getElementById('balanceReason').value;
    
    if (!amount || amount === 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (!confirm(`Are you sure you want to ${amount > 0 ? 'add' : 'subtract'} ${Math.abs(amount)} USDT ${amount > 0 ? 'to' : 'from'} this user's balance?`)) {
        return;
    }
    
    try {
        await adminApi.put(`users/${window.currentUserId}/balance`, { amount, reason });
        alert('Balance updated successfully');
        viewUser(window.currentUserId); // Reload user details
        loadUsers(); // Reload users list
        loadDashboardStats(); // Update dashboard stats
    } catch (error) {
        console.error('Update balance error:', error);
        alert('Error updating balance: ' + error.message);
    }
}

async function toggleUserStatus(userId) {
    if (!confirm('Are you sure you want to change this user\'s status?')) {
        return;
    }
    
    try {
        await adminApi.put(`users/${userId}/toggle-status`);
        loadUsers();
        loadDashboardStats();
    } catch (error) {
        console.error('Toggle status error:', error);
        alert('Error updating user status: ' + error.message);
    }
}

// ============================================
// DEPOSITS
// ============================================

document.getElementById('depositStatusFilter').addEventListener('change', loadDeposits);

async function loadDeposits() {
    try {
        const status = document.getElementById('depositStatusFilter').value;
        const data = await adminApi.get(`deposits?status=${status}`);
        
        const tbody = document.getElementById('depositsTableBody');
        
        if (data.deposits.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No deposits found</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.deposits.map(deposit => `
            <tr>
                <td>${deposit.id}</td>
                <td>${deposit.full_name}<br><small>${deposit.email}</small></td>
                <td>${parseFloat(deposit.amount).toFixed(2)}</td>
                <td>${deposit.crypto}</td>
                <td><small>${deposit.wallet_address || '-'}</small></td>
                <td><small>${deposit.tx_hash || '-'}</small></td>
                <td>
                    <span class="badge ${getStatusBadge(deposit.status)}">${deposit.status}</span>
                </td>
                <td>${new Date(deposit.created_at).toLocaleDateString()}</td>
                <td>
                    ${deposit.status === 'pending' ? `
                        <button class="btn-action btn-approve" onclick="approveDeposit(${deposit.id})">Approve</button>
                        <button class="btn-action btn-reject" onclick="rejectDeposit(${deposit.id})">Reject</button>
                    ` : '-'}
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Load deposits error:', error);
        alert('Error loading deposits: ' + error.message);
    }
}

async function approveDeposit(depositId) {
    const txHash = prompt('Enter transaction hash (optional):');
    
    if (!confirm('Are you sure you want to approve this deposit?')) {
        return;
    }
    
    try {
        await adminApi.put(`deposits/${depositId}`, { status: 'confirmed', txHash });
        alert('Deposit approved successfully');
        loadDeposits();
        loadDashboardStats();
    } catch (error) {
        console.error('Approve deposit error:', error);
        alert('Error approving deposit: ' + error.message);
    }
}

async function rejectDeposit(depositId) {
    if (!confirm('Are you sure you want to reject this deposit?')) {
        return;
    }
    
    try {
        await adminApi.put(`deposits/${depositId}`, { status: 'rejected' });
        alert('Deposit rejected');
        loadDeposits();
        loadDashboardStats();
    } catch (error) {
        console.error('Reject deposit error:', error);
        alert('Error rejecting deposit: ' + error.message);
    }
}

// ============================================
// WITHDRAWALS
// ============================================

document.getElementById('withdrawalStatusFilter').addEventListener('change', loadWithdrawals);

async function loadWithdrawals() {
    try {
        const status = document.getElementById('withdrawalStatusFilter').value;
        const data = await adminApi.get(`withdrawals?status=${status}`);
        
        const tbody = document.getElementById('withdrawalsTableBody');
        
        if (data.withdrawals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No withdrawals found</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.withdrawals.map(withdrawal => `
            <tr>
                <td>${withdrawal.id}</td>
                <td>${withdrawal.full_name}<br><small>${withdrawal.email}</small></td>
                <td>${parseFloat(withdrawal.amount).toFixed(2)}</td>
                <td>${withdrawal.crypto}</td>
                <td><small>${withdrawal.wallet_address}</small></td>
                <td><small>${withdrawal.tx_hash || '-'}</small></td>
                <td>
                    <span class="badge ${getStatusBadge(withdrawal.status)}">${withdrawal.status}</span>
                </td>
                <td>${new Date(withdrawal.created_at).toLocaleDateString()}</td>
                <td>
                    ${withdrawal.status === 'processing' ? `
                        <button class="btn-action btn-approve" onclick="completeWithdrawal(${withdrawal.id})">Complete</button>
                        <button class="btn-action btn-reject" onclick="rejectWithdrawal(${withdrawal.id})">Reject</button>
                    ` : '-'}
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Load withdrawals error:', error);
        alert('Error loading withdrawals: ' + error.message);
    }
}

async function completeWithdrawal(withdrawalId) {
    const txHash = prompt('Enter transaction hash:');
    
    if (!txHash) {
        alert('Transaction hash is required to complete withdrawal');
        return;
    }
    
    if (!confirm('Are you sure you want to complete this withdrawal?')) {
        return;
    }
    
    try {
        await adminApi.put(`withdrawals/${withdrawalId}`, { status: 'completed', txHash });
        alert('Withdrawal completed successfully');
        loadWithdrawals();
        loadDashboardStats();
    } catch (error) {
        console.error('Complete withdrawal error:', error);
        alert('Error completing withdrawal: ' + error.message);
    }
}

async function rejectWithdrawal(withdrawalId) {
    if (!confirm('Are you sure you want to reject this withdrawal? The balance will be returned to the user.')) {
        return;
    }
    
    try {
        await adminApi.put(`withdrawals/${withdrawalId}`, { status: 'rejected' });
        alert('Withdrawal rejected and balance returned to user');
        loadWithdrawals();
        loadDashboardStats();
    } catch (error) {
        console.error('Reject withdrawal error:', error);
        alert('Error rejecting withdrawal: ' + error.message);
    }
}

// ============================================
// SETTINGS
// ============================================

async function loadSettings() {
    try {
        const data = await adminApi.get('settings');
        const settings = data.settings;
        
        Object.keys(settings).forEach(key => {
            const input = document.getElementById(`setting-${key}`);
            if (input) {
                input.value = settings[key].value;
            }
        });
        
    } catch (error) {
        console.error('Load settings error:', error);
        alert('Error loading settings: ' + error.message);
    }
}

async function saveSettings() {
    const settingKeys = [
        'min_deposit', 'min_withdrawal', 'withdrawal_fee',
        'click_percentage_min', 'click_percentage_max',
        'level_1_clicks', 'level_2_clicks', 'level_2_referrals',
        'level_3_clicks', 'level_3_referrals',
        'referral_commission_min', 'referral_commission_max'
    ];
    
    try {
        for (const key of settingKeys) {
            const input = document.getElementById(`setting-${key}`);
            if (input) {
                await adminApi.put('settings', { key, value: input.value });
            }
        }
        
        alert('All settings saved successfully!');
        
    } catch (error) {
        console.error('Save settings error:', error);
        alert('Error saving settings: ' + error.message);
    }
}

async function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (!current || !newPass || !confirm) {
        alert('Please fill all password fields');
        return;
    }
    
    if (newPass !== confirm) {
        alert('New passwords do not match');
        return;
    }
    
    if (newPass.length < 8) {
        alert('New password must be at least 8 characters');
        return;
    }
    
    try {
        await adminApi.post('change-password', { 
            currentPassword: current, 
            newPassword: newPass 
        });
        
        alert('Password changed successfully!');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
    } catch (error) {
        console.error('Change password error:', error);
        alert('Error changing password: ' + error.message);
    }
}

// ============================================
// HELPERS
// ============================================

function getStatusBadge(status) {
    const badges = {
        'pending': 'badge-warning',
        'processing': 'badge-warning',
        'confirmed': 'badge-success',
        'completed': 'badge-success',
        'rejected': 'badge-danger'
    };
    return badges[status] || 'badge-info';
}

function renderPagination(elementId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(elementId);
    let html = '';
    
    if (currentPage > 1) {
        html += `<button onclick="(${onPageChange.toString()})(${currentPage - 1})">Previous</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" 
                     onclick="(${onPageChange.toString()})(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span>...</span>';
        }
    }
    
    if (currentPage < totalPages) {
        html += `<button onclick="(${onPageChange.toString()})(${currentPage + 1})">Next</button>`;
    }
    
    container.innerHTML = html;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const userModal = document.getElementById('userModal');
    const withdrawModal = document.getElementById('withdrawToWalletModal');
    const walletBalancesModal = document.getElementById('walletBalancesModal');
    if (event.target === userModal) {
        closeUserModal();
    }
    if (event.target === withdrawModal) {
        closeWithdrawModal();
    }
    if (event.target === walletBalancesModal) {
        closeWalletBalancesModal();
    }
}

// ====== ADMIN WALLETS FUNCTIONALITY ======

let currentWithdrawUserId = null;
let currentWithdrawCrypto = null;
let currentWithdrawMax = 0;

async function loadAdminWallets() {
    try {
        const data = await adminApi.get('admin-wallets/summary');
        
        // Update stats
        document.getElementById('totalWithdrawable').textContent = `${parseFloat(data.totalWithdrawable || 0).toFixed(2)} USDT`;
        document.getElementById('usersWithDeposits').textContent = data.usersWithDeposits || 0;
        document.getElementById('pendingDepositsCount').textContent = data.pendingDeposits || 0;
        document.getElementById('approvedDepositsCount').textContent = data.approvedDeposits || 0;
        
        // Render crypto balances grid
        const grid = document.getElementById('cryptoBalancesGrid');
        if (!data.cryptoBalances || data.cryptoBalances.length === 0) {
            grid.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No crypto balances available</p>';
        } else {
            grid.innerHTML = data.cryptoBalances.map(crypto => `
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="color: #34c759; font-size: 24px; margin-bottom: 10px;">${crypto.crypto}</h3>
                    <p style="font-size: 32px; font-weight: 700; margin: 15px 0;">${parseFloat(crypto.total_amount).toFixed(8)}</p>
                    <p style="color: rgba(255,255,255,0.6); font-size: 14px;">From ${crypto.user_count} user(s)</p>
                    <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 10px;">Total deposits: ${crypto.deposit_count}</p>
                </div>
            `).join('');
        }
        
        // Render users table
        const tbody = document.getElementById('usersWithDepositsTable');
        if (!data.usersWithDeposits || data.usersWithDeposits.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No users with approved deposits</td></tr>';
        } else {
            tbody.innerHTML = data.usersWithDeposits.map(user => `
                <tr>
                    <td>${user.user_id}</td>
                    <td>${user.full_name}</td>
                    <td>${user.email}</td>
                    <td><span style="color: #34c759; font-weight: bold;">${parseFloat(user.balance).toFixed(2)} USDT</span></td>
                    <td><span style="color: #34c759;">${parseFloat(user.total_deposits).toFixed(2)}</span></td>
                    <td>
                        ${user.cryptos.split(',').map(c => `<span class="badge badge-info">${c}</span>`).join(' ')}
                    </td>
                    <td>
                        <button class="btn-action btn-approve" onclick="openWithdrawModal(${user.user_id})" style="margin-right: 5px;">
                            🏦 Withdraw
                        </button>
                        <button class="btn-action" onclick="openWalletBalancesModal(${user.user_id})" style="background: rgba(94, 92, 230, 0.2); border: 1px solid rgba(94, 92, 230, 0.5); color: #5e5ce6;">
                            💰 Cashout
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
    } catch (error) {
        console.error('Load admin wallets error:', error);
        alert('Error loading wallet data: ' + error.message);
    }
}

async function openWithdrawModal(userId) {
    try {
        const data = await adminApi.get(`admin-wallets/user/${userId}`);
        const user = data.user;
        
        currentWithdrawUserId = userId;
        
        // Display user info
        document.getElementById('withdrawUserInfo').innerHTML = `
            <p><strong>Name:</strong> ${user.full_name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Balance:</strong> <span style="color: #34c759; font-weight: bold;">${parseFloat(user.balance).toFixed(2)} USDT</span></p>
            <p><strong>Total Approved Deposits:</strong> ${parseFloat(user.total_deposits || 0).toFixed(2)} USDT</p>
        `;
        
        // Display crypto options
        const cryptoSelection = document.getElementById('cryptoSelection');
        if (!data.deposits || data.deposits.length === 0) {
            cryptoSelection.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No approved deposits found for this user</p>';
        } else {
            // Group deposits by crypto
            const cryptoGroups = {};
            data.deposits.forEach(deposit => {
                if (!cryptoGroups[deposit.crypto]) {
                    cryptoGroups[deposit.crypto] = 0;
                }
                cryptoGroups[deposit.crypto] += parseFloat(deposit.amount);
            });
            
            cryptoSelection.innerHTML = Object.entries(cryptoGroups).map(([crypto, amount]) => `
                <button onclick="selectCrypto('${crypto}', ${amount})" style="padding: 15px 20px; background: rgba(52, 199, 89, 0.1); border: 2px solid rgba(52, 199, 89, 0.3); border-radius: 10px; color: #34c759; cursor: pointer; font-weight: 600; font-size: 15px; transition: all 0.3s; text-align: left;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>💎 ${crypto}</span>
                        <span style="font-size: 18px;">${amount.toFixed(8)}</span>
                    </div>
                </button>
            `).join('');
        }
        
        // Reset form
        document.getElementById('withdrawFormSection').style.display = 'none';
        document.getElementById('withdrawAmount').value = '';
        document.getElementById('adminWalletAddress').value = '';
        document.getElementById('withdrawReason').value = '';
        
        // Show modal
        document.getElementById('withdrawToWalletModal').style.display = 'block';
        
    } catch (error) {
        console.error('Open withdraw modal error:', error);
        alert('Error loading withdrawal data: ' + error.message);
    }
}

function selectCrypto(crypto, maxAmount) {
    currentWithdrawCrypto = crypto;
    currentWithdrawMax = maxAmount;
    
    document.getElementById('selectedCrypto').textContent = crypto;
    document.getElementById('availableAmount').textContent = `${maxAmount.toFixed(8)} ${crypto}`;
    document.getElementById('cryptoLabel').textContent = crypto;
    
    document.getElementById('withdrawFormSection').style.display = 'block';
    
    // Scroll to form
    document.getElementById('withdrawFormSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setMaxWithdraw() {
    document.getElementById('withdrawAmount').value = currentWithdrawMax.toFixed(8);
}

async function processAdminWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const walletAddress = document.getElementById('adminWalletAddress').value.trim();
    const reason = document.getElementById('withdrawReason').value.trim();
    
    // Validation
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (amount > currentWithdrawMax) {
        alert(`Amount cannot exceed ${currentWithdrawMax.toFixed(8)} ${currentWithdrawCrypto}`);
        return;
    }
    
    if (!walletAddress) {
        alert('Please enter your wallet address');
        return;
    }
    
    if (walletAddress.length < 20) {
        alert('Please enter a valid wallet address');
        return;
    }
    
    // Confirmation
    const confirmMsg = `
⚠️ CONFIRM ADMIN WITHDRAWAL ⚠️

Amount: ${amount.toFixed(8)} ${currentWithdrawCrypto}
To Wallet: ${walletAddress}
From User ID: ${currentWithdrawUserId}

This will:
1. Deduct ${amount.toFixed(8)} ${currentWithdrawCrypto} from user's balance
2. Record transaction to your wallet: ${walletAddress}
3. Create admin withdrawal record

Continue?
    `;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    try {
        const response = await adminApi.post('admin-wallets/withdraw', {
            userId: currentWithdrawUserId,
            crypto: currentWithdrawCrypto,
            amount: amount,
            walletAddress: walletAddress,
            reason: reason || 'Admin withdrawal'
        });
        
        alert(`✅ SUCCESS!\n\n${amount.toFixed(8)} ${currentWithdrawCrypto} has been withdrawn!\n\nTransaction ID: ${response.transactionId}\n\nPlease send the crypto to:\n${walletAddress}`);
        
        closeWithdrawModal();
        loadAdminWallets();
        
    } catch (error) {
        console.error('Process withdrawal error:', error);
        alert('Error processing withdrawal: ' + error.message);
    }
}

function closeWithdrawModal() {
    document.getElementById('withdrawToWalletModal').style.display = 'none';
    currentWithdrawUserId = null;
    currentWithdrawCrypto = null;
    currentWithdrawMax = 0;
}

// ====== QUICK CRYPTO WITHDRAWAL (from Users Table) ======
async function quickWithdrawCrypto(userId) {
    try {
        // Get user deposits data
        const data = await adminApi.get(`admin-wallets/user/${userId}`);
        
        if (!data.deposits || data.deposits.length === 0) {
            alert('No real crypto deposits found for this user.');
            return;
        }
        
        // Show withdrawal modal with user info
        openWithdrawModal(userId);
        
    } catch (error) {
        console.error('Quick withdraw error:', error);
        alert('Error loading user deposits: ' + error.message);
    }
}

// ====== WALLET BALANCES & CASHOUT ======

let currentCashoutUserId = null;
let currentCashoutUserData = null;

async function openWalletBalancesModal(userId) {
    try {
        const data = await adminApi.get(`admin-wallets/user-balances/${userId}`);
        
        currentCashoutUserId = userId;
        currentCashoutUserData = data;
        
        // Display user info
        document.getElementById('cashoutUserInfo').innerHTML = `
            <p><strong>User ID:</strong> ${data.user.id}</p>
            <p><strong>Name:</strong> ${data.user.full_name}</p>
            <p><strong>Email:</strong> ${data.user.email}</p>
        `;
        
        // Display wallet balances
        const balancesContainer = document.getElementById('walletBalancesContainer');
        const balances = data.walletBalances;
        
        if (Object.keys(balances).length === 0) {
            balancesContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No on-chain balances found</p>';
        } else {
            balancesContainer.innerHTML = Object.entries(balances).map(([crypto, info]) => `
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h3 style="color: #34c759; font-size: 20px; margin-bottom: 5px;">${crypto}</h3>
                            <p style="color: rgba(255,255,255,0.6); font-size: 12px; word-break: break-all;">${info.address}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 24px; font-weight: 700; color: #34c759;">${parseFloat(info.balance).toFixed(8)}</p>
                            <p style="color: rgba(255,255,255,0.5); font-size: 12px;">${crypto}</p>
                        </div>
                    </div>
                    <button onclick="initiateCashout('${crypto}', '${info.balance}', '${info.address}')" 
                            style="width: 100%; padding: 12px; background: rgba(94, 92, 230, 0.8); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; font-size: 14px;">
                        ⚡ Cashout ${crypto}
                    </button>
                </div>
            `).join('');
        }
        
        // Show modal
        document.getElementById('walletBalancesModal').style.display = 'block';
        
    } catch (error) {
        console.error('Open wallet balances modal error:', error);
        alert('Error loading wallet balances: ' + error.message);
    }
}

function initiateCashout(crypto, balance, fromAddress) {
    const adminAddress = prompt(`Enter your ${crypto} wallet address to receive the funds:`);
    
    if (!adminAddress) {
        return;
    }
    
    if (adminAddress.length < 20) {
        alert('Invalid wallet address');
        return;
    }
    
    const confirmMsg = `
⚠️ CONFIRM CRYPTO CASHOUT ⚠️

Amount: ${parseFloat(balance).toFixed(8)} ${crypto}
From Address: ${fromAddress}
To Your Address: ${adminAddress}

This will:
1. Send ALL ${crypto} from user's on-chain wallet
2. Transfer directly to your wallet address
3. Record the transaction on blockchain
4. Log the cashout in admin records

This action CANNOT be reversed!

Continue?
    `;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    processCashout(crypto, adminAddress);
}

async function processCashout(crypto, adminWalletAddress) {
    try {
        const response = await adminApi.post('admin-wallets/cashout', {
            userId: currentCashoutUserId,
            crypto: crypto,
            adminWalletAddress: adminWalletAddress
        });
        
        if (response.success) {
            alert(`✅ CASHOUT SUCCESSFUL!\n\nCrypto: ${crypto}\nAmount: ${response.amount}\nTX Hash: ${response.txHash}\n\nThe crypto has been sent to your wallet!`);
            
            closeWalletBalancesModal();
            loadAdminWallets();
        } else {
            alert('❌ Cashout failed: ' + response.message);
        }
        
    } catch (error) {
        console.error('Process cashout error:', error);
        alert('Error processing cashout: ' + error.message);
    }
}

function closeWalletBalancesModal() {
    document.getElementById('walletBalancesModal').style.display = 'none';
    currentCashoutUserId = null;
    currentCashoutUserData = null;
}

// Initial load
loadDashboardStats();

