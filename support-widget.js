// ============================================
// SUPPORT WIDGET - Frontend Only (Demo)
// ============================================

console.log('💬 Support Widget geladen (Demo-Modus)');

// Support Widget HTML erstellen
function createSupportWidget() {
    const widgetHTML = `
        <!-- Support Button -->
        <button class="support-button" id="supportButton" aria-label="Open Support">
            <svg viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
            </svg>
        </button>

        <!-- Support Widget -->
        <div class="support-widget" id="supportWidget">
            <!-- Header -->
            <div class="support-widget-header">
                <div class="support-widget-header-left">
                    <div class="support-widget-logo">
                        <div class="support-widget-logo-letter">C</div>
                        <div class="support-widget-logo-letter">Q</div>
                    </div>
                </div>
                <button class="support-widget-close" id="closeSupportWidget" aria-label="Close">×</button>
            </div>

            <!-- Body -->
            <div class="support-widget-body" id="supportWidgetBody">
                <!-- Greeting -->
                <div class="support-greeting">
                    <h2>Hi <span id="supportUsername">Demo User</span> 👋</h2>
                    <p>How can we help?</p>
                </div>

                <!-- Message Input -->
                <div class="support-message-input" onclick="openMessageBox()">
                    <input type="text" placeholder="Send us a message" readonly>
                    <svg viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </div>

                <!-- Search -->
                <div class="support-search">
                    <svg viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <input type="text" placeholder="Search for help" id="supportSearch">
                </div>

                <!-- FAQ List -->
                <div class="support-faq-list">
                    <div class="support-faq-item" onclick="showFAQAnswer('withdrawal')">
                        <span>How much time does it take for a withdrawal?</span>
                        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                    </div>
                    <div class="support-faq-item" onclick="showFAQAnswer('deposit')">
                        <span>Crypto deposit has not been credited?</span>
                        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                    </div>
                    <div class="support-faq-item" onclick="showFAQAnswer('earnings')">
                        <span>How does the daily earning system work?</span>
                        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                    </div>
                    <div class="support-faq-item" onclick="showFAQAnswer('referrals')">
                        <span>Referral System Overview</span>
                        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                    </div>
                    <div class="support-faq-item" onclick="showFAQAnswer('verification')">
                        <span>Account verification requirements</span>
                        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                    </div>
                    <div class="support-faq-item" onclick="showFAQAnswer('levels')">
                        <span>How to level up my account?</span>
                        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="support-widget-footer">
                <button class="support-footer-btn active">
                    <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                    <span>Home</span>
                </button>
                <button class="support-footer-btn">
                    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                    <span>Messages</span>
                </button>
                <button class="support-footer-btn">
                    <svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>
                    <span>Help</span>
                </button>
            </div>
        </div>
    `;

    // Widget zum Body hinzufügen
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
}

// Widget initialisieren
function initSupportWidget() {
    // Widget erstellen
    createSupportWidget();

    // Username aktualisieren
    const username = getUserDisplayName();
    const usernameEl = document.getElementById('supportUsername');
    if (usernameEl) {
        usernameEl.textContent = username;
    }

    // Event Listeners
    const supportButton = document.getElementById('supportButton');
    const supportWidget = document.getElementById('supportWidget');
    const closeButton = document.getElementById('closeSupportWidget');

    if (supportButton) {
        supportButton.addEventListener('click', toggleSupportWidget);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeSupportWidget);
    }

    // Close bei Klick außerhalb
    document.addEventListener('click', function(e) {
        if (supportWidget && supportWidget.classList.contains('active')) {
            if (!supportWidget.contains(e.target) && !supportButton.contains(e.target)) {
                closeSupportWidget();
            }
        }
    });

    // Search funktionalität
    const searchInput = document.getElementById('supportSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterFAQs);
    }
}

// Username ermitteln
function getUserDisplayName() {
    try {
        // Demo-User aus localStorage
        const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
        if (demoUser.full_name) {
            return demoUser.full_name.split(' ')[0]; // Nur Vorname
        }

        // User aus localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.full_name) {
            return userData.full_name.split(' ')[0];
        }

        return 'there';
    } catch (e) {
        return 'there';
    }
}

// Widget öffnen/schließen
function toggleSupportWidget() {
    const widget = document.getElementById('supportWidget');
    if (widget) {
        widget.classList.toggle('active');
    }
}

function closeSupportWidget() {
    const widget = document.getElementById('supportWidget');
    if (widget) {
        widget.classList.remove('active');
    }
}

function openSupportWidget() {
    const widget = document.getElementById('supportWidget');
    if (widget) {
        widget.classList.add('active');
    }
}

// Message Box öffnen
function openMessageBox() {
    alert('💬 Chat-Funktion (Demo)\n\nDiese Funktion wird mit dem Backend auf deinem anderen PC verbunden!\n\nDann kannst du hier:\n✅ Nachrichten senden\n✅ Live-Antworten erhalten\n✅ Chat-Historie sehen');
}

// FAQ Antworten zeigen
function showFAQAnswer(topic) {
    const answers = {
        'withdrawal': {
            title: 'Withdrawal Processing Time',
            content: `Our withdrawal process typically takes:\n\n• USDT (TRC20): 1-4 hours\n• Bitcoin: 2-6 hours\n• Ethereum: 1-3 hours\n\nAll withdrawals are processed manually by our team for security. You'll receive an email confirmation once processed.`
        },
        'deposit': {
            title: 'Deposit Not Credited',
            content: `If your deposit hasn't been credited:\n\n1. Check your transaction hash on the blockchain\n2. Ensure you sent to the correct address\n3. Wait for network confirmations (usually 1-6)\n4. Contact support with your TX hash\n\nMost deposits are credited within 30 minutes.`
        },
        'earnings': {
            title: 'Daily Earning System',
            content: `The Quantification system works as follows:\n\n• Click daily to earn 5-10% on your balance\n• Number of clicks depends on your level\n• Level 1: 3 clicks/day\n• Level 2: 5 clicks/day\n• Level 3: 7 clicks/day\n\nClicks reset daily at midnight UTC.`
        },
        'referrals': {
            title: 'Referral System',
            content: `Earn with our referral program:\n\n• Get 3-5% commission on referral activities\n• Share your unique referral link\n• Track your team in the Team page\n• Commission is credited instantly\n\nInvite friends to level up faster!`
        },
        'verification': {
            title: 'Account Verification',
            content: `Currently, email verification is required:\n\n✅ Email verified at registration\n✅ No KYC required for now\n✅ 2FA coming soon\n\nFor large withdrawals (>$1000), additional verification may be requested.`
        },
        'levels': {
            title: 'Account Levels',
            content: `Level up by inviting friends:\n\n📊 Level 1: Start (0 referrals)\n📊 Level 2: Invite 5 people\n📊 Level 3: Invite 10 people\n\nHigher levels = more daily clicks + higher earning rates!`
        }
    };

    const answer = answers[topic];
    if (answer) {
        alert(`${answer.title}\n\n${answer.content}`);
    }
}

// FAQ Suche/Filter
function filterFAQs() {
    const searchInput = document.getElementById('supportSearch');
    const faqItems = document.querySelectorAll('.support-faq-item');
    const searchTerm = searchInput.value.toLowerCase();

    faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Widget initialisieren wenn DOM geladen ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupportWidget);
} else {
    initSupportWidget();
}

// Global verfügbar machen
window.openSupportWidget = openSupportWidget;
window.closeSupportWidget = closeSupportWidget;
window.toggleSupportWidget = toggleSupportWidget;

