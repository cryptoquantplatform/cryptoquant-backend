// Notifications System

let notificationsData = [];
let unreadCount = 0;

// Initialize notifications
async function initNotifications() {
    // Create notification bell in navbar
    createNotificationBell();
    
    // Load notifications
    await loadNotifications();
    
    // Poll for new notifications every 30 seconds
    setInterval(loadNotifications, 30000);
}

// Create notification bell
function createNotificationBell() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const userInfo = navbar.querySelector('.user-info');
    if (!userInfo) return;
    
    const bellContainer = document.createElement('div');
    bellContainer.style.cssText = 'position: relative; margin-right: 20px; cursor: pointer;';
    bellContainer.innerHTML = `
        <div id="notificationBell" onclick="toggleNotifications()" style="position: relative;">
            <svg width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span id="notificationBadge" style="display: none; position: absolute; top: -5px; right: -5px; background: #ff3b30; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; font-weight: bold; text-align: center; line-height: 18px;">0</span>
        </div>
    `;
    
    userInfo.parentElement.insertBefore(bellContainer, userInfo);
    
    // Create notifications dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'notificationsDropdown';
    dropdown.style.cssText = 'display: none; position: absolute; top: 60px; right: 20px; width: 400px; max-height: 500px; background: rgba(20, 20, 40, 0.98); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 15px; overflow: hidden; z-index: 1000; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);';
    
    dropdown.innerHTML = `
        <div style="padding: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 16px; color: white;">Notifications</h3>
            <button onclick="markAllAsRead()" style="background: rgba(52, 199, 89, 0.2); border: 1px solid rgba(52, 199, 89, 0.3); color: #34c759; padding: 5px 10px; border-radius: 6px; font-size: 12px; cursor: pointer;">Mark all read</button>
        </div>
        <div id="notificationsList" style="max-height: 400px; overflow-y: auto;">
            <p style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 40px 20px;">Loading...</p>
        </div>
    `;
    
    document.body.appendChild(dropdown);
}

// Load notifications
async function loadNotifications() {
    try {
        const response = await fetch(API_BASE_URL + '/notifications', {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            notificationsData = data.notifications;
            updateNotificationBadge();
            renderNotifications();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Update notification badge
function updateNotificationBadge() {
    unreadCount = notificationsData.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Render notifications
function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;
    
    if (notificationsData.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 40px 20px;">No notifications</p>';
        return;
    }
    
    list.innerHTML = notificationsData.map(notification => {
        const date = new Date(notification.created_at);
        const timeAgo = getTimeAgo(date);
        
        return `
            <div onclick="markAsRead(${notification.id})" style="padding: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; background: ${notification.read ? 'transparent' : 'rgba(52, 199, 89, 0.05)'}; transition: background 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.05)'" onmouseout="this.style.background='${notification.read ? 'transparent' : 'rgba(52, 199, 89, 0.05)'}'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                    <h4 style="margin: 0; font-size: 14px; color: ${notification.read ? 'rgba(255, 255, 255, 0.7)' : 'white'}; font-weight: ${notification.read ? 'normal' : 'bold'};">${notification.title}</h4>
                    ${!notification.read ? '<span style="width: 8px; height: 8px; background: #34c759; border-radius: 50%; margin-left: 10px;"></span>' : ''}
                </div>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: rgba(255, 255, 255, 0.6); line-height: 1.4;">${notification.message}</p>
                <p style="margin: 8px 0 0 0; font-size: 11px; color: rgba(255, 255, 255, 0.4);">${timeAgo}</p>
            </div>
        `;
    }).join('');
}

// Toggle notifications dropdown
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Mark notification as read
async function markAsRead(notificationId) {
    try {
        await fetch(API_BASE_URL + `/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        
        // Update local data
        const notification = notificationsData.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            updateNotificationBadge();
            renderNotifications();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Mark all as read
async function markAllAsRead() {
    try {
        await fetch(API_BASE_URL + '/notifications/mark-all-read', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        
        // Update local data
        notificationsData.forEach(n => n.read = true);
        updateNotificationBadge();
        renderNotifications();
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    
    return date.toLocaleDateString();
}

// Get token from storage
function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notificationsDropdown');
    const bell = document.getElementById('notificationBell');
    
    if (dropdown && bell && !dropdown.contains(event.target) && !bell.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
} else {
    initNotifications();
}

