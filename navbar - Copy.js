// Navigation Menu JavaScript

// Set active link based on current page
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navLinks = document.querySelectorAll('.navbar-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar-container')) {
                menu.classList.remove('active');
            }
        });
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Remove all user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
    return false; // Prevent default link behavior
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
    initMobileMenu();
});

