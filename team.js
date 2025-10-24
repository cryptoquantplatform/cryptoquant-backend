// Team JavaScript - MLM PYRAMID SYSTEM

let teamData = null;
let currentFilter = 'all';

// Initialize team page
async function initTeam() {
    if (!api.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }
    
    await loadTeamData();
}

// Load ALL team data from API (entire pyramid!)
async function loadTeamData() {
    try {
        const response = await api.get('/team');
        teamData = response.data;
        
        // Update all sections
        updateTeamStats();
        updateReferralLink();
        updatePyramidLevels();
        updateTeamMembers();
        
    } catch (error) {
        console.error('Error loading team data:', error);
        alert('Error loading team data: ' + error.message);
    }
}

// Update team statistics
function updateTeamStats() {
    if (!teamData) return;
    
    const stats = teamData.stats;
    
    document.getElementById('totalMembers').textContent = stats.totalMembers; // TOTAL pyramid
    document.getElementById('activeMembers').textContent = stats.activeMembers;
    document.getElementById('teamEarnings').textContent = stats.teamEarnings + ' USD';
    document.getElementById('yourCommission').textContent = stats.commissionEarned + ' USD';
}

// Update referral link
function updateReferralLink() {
    if (!teamData) return;
    
    const referralLinkInput = document.getElementById('referralLink');
    const referralCodeSpan = document.getElementById('referralCode');
    
    if (referralLinkInput) {
        referralLinkInput.value = teamData.referralLink;
    }
    
    if (referralCodeSpan) {
        referralCodeSpan.textContent = teamData.referralCode;
    }
}

// Update pyramid level counts (NEW!)
function updatePyramidLevels() {
    if (!teamData) return;
    
    const stats = teamData.stats;
    
    // Update level badges
    const level1Badge = document.getElementById('level1Count');
    const level2Badge = document.getElementById('level2Count');
    const level3Badge = document.getElementById('level3PlusCount');
    
    if (level1Badge) level1Badge.textContent = stats.level1Count || 0;
    if (level2Badge) level2Badge.textContent = stats.level2Count || 0;
    if (level3Badge) level3Badge.textContent = stats.level3PlusCount || 0;
}

// Update team members table
function updateTeamMembers() {
    if (!teamData) return;
    
    let members = teamData.members;
    
    // Apply filter
    if (currentFilter !== 'all') {
        const filterLevel = parseInt(currentFilter);
        members = members.filter(m => m.pyramidLevel === filterLevel);
    }
    
    const tableBody = document.getElementById('membersTableBody');
    if (!tableBody) return;
    
    if (members.length === 0) {
        tableBody.innerHTML = `
            <tr class="no-data">
                <td colspan="7">No team members yet. Start inviting!</td>
            </tr>
        `;
        return;
    }
    
    // Populate table with pyramid level info
    tableBody.innerHTML = members.map(member => {
        const joinDate = new Date(member.joinDate).toLocaleDateString();
        const statusClass = member.status === 'active' ? 'style="color: #10b981;"' : 'style="color: #94a3b8;"';
        
        // Pyramid level badge
        let pyramidBadge = '';
        if (member.pyramidLevel === 1) {
            pyramidBadge = '<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Level 1 (Direct)</span>';
        } else if (member.pyramidLevel === 2) {
            pyramidBadge = '<span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Level 2</span>';
        } else {
            pyramidBadge = '<span style="background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Level ' + member.pyramidLevel + '</span>';
        }
        
        return `
            <tr>
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${pyramidBadge}</td>
                <td>Level ${member.level}</td>
                <td>${joinDate}</td>
                <td ${statusClass}>${member.status}</td>
                <td>${member.commissionEarned} USDT</td>
            </tr>
        `;
    }).join('');
}

// Filter team by pyramid level
function filterLevel(level) {
    currentFilter = level;
    
    // Update button states
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    updateTeamMembers();
}

// Copy referral link
function copyReferralLink() {
    const input = document.getElementById('referralLink');
    if (input) {
        input.select();
        document.execCommand('copy');
        
        alert('Referral link copied to clipboard!');
    }
}

// Copy referral code
function copyReferralCode() {
    const code = userData.referralCode;
    
    // Create temporary input
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = 'rgba(16, 185, 129, 0.3)';
    btn.style.color = '#10b981';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
    }, 2000);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initTeam);

// Make functions globally available
window.filterLevel = filterLevel;
window.copyReferralLink = copyReferralLink;
window.copyReferralCode = copyReferralCode;

