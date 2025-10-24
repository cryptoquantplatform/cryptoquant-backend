// Country codes data
const countryCodes = [
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+40', country: 'Romania', flag: '🇷🇴' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿' },
    { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
    { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '+972', country: 'Israel', flag: '🇮🇱' },
    { code: '+98', country: 'Iran', flag: '🇮🇷' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
    { code: '+853', country: 'Macau', flag: '🇲🇴' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
    { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
    { code: '+856', country: 'Laos', flag: '🇱🇦' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+51', country: 'Peru', flag: '🇵🇪' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
    { code: '+507', country: 'Panama', flag: '🇵🇦' },
    { code: '+1-876', country: 'Jamaica', flag: '🇯🇲' },
    { code: '+1-809', country: 'Dominican Republic', flag: '🇩🇴' }
];

// Initialize country code dropdown
function initCountryCodeDropdown(selectElementId, phoneInputId) {
    const selectElement = document.getElementById(selectElementId);
    const phoneInput = document.getElementById(phoneInputId);
    
    if (!selectElement || !phoneInput) {
        console.log('Country code dropdown elements not found:', selectElementId, phoneInputId);
        return;
    }
    
    // Create custom dropdown
    const wrapper = document.createElement('div');
    wrapper.className = 'country-code-wrapper';
    wrapper.style.position = 'relative';
    
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    wrapper.appendChild(selectElement);
    selectElement.style.display = 'none';
    
    // Create display button
    const displayBtn = document.createElement('button');
    displayBtn.type = 'button';
    displayBtn.className = 'country-code-display';
    displayBtn.innerHTML = '🇦🇹 +43';
    wrapper.appendChild(displayBtn);
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'country-code-dropdown';
    dropdown.style.display = 'none';
    
    // Search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'country-code-search';
    searchInput.placeholder = 'Search country...';
    dropdown.appendChild(searchInput);
    
    // Options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'country-code-options';
    dropdown.appendChild(optionsContainer);
    
    wrapper.appendChild(dropdown);
    
    // Store current country code value
    let currentCountryCode = '+43'; // Default Austria
    
    // Populate options
    function renderOptions(filter = '') {
        optionsContainer.innerHTML = '';
        const filtered = countryCodes.filter(c => 
            c.country.toLowerCase().includes(filter.toLowerCase()) ||
            c.code.includes(filter)
        );
        
        filtered.forEach(country => {
            const option = document.createElement('div');
            option.className = 'country-code-option';
            option.innerHTML = `${country.flag} ${country.country} <span>${country.code}</span>`;
            option.onclick = () => {
                currentCountryCode = country.code;
                displayBtn.innerHTML = `${country.flag} ${country.code}`;
                selectElement.value = country.code;
                selectElement.setAttribute('data-country-code', country.code);
                dropdown.style.display = 'none';
                phoneInput.focus();
            };
            optionsContainer.appendChild(option);
        });
    }
    
    renderOptions();
    
    // Toggle dropdown
    displayBtn.onclick = () => {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        if (dropdown.style.display === 'block') {
            searchInput.focus();
        }
    };
    
    // Search functionality
    searchInput.oninput = (e) => {
        renderOptions(e.target.value);
    };
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    // Set default value
    selectElement.value = '+43'; // Austria default
    selectElement.setAttribute('data-country-code', '+43');
    
    // Add getter function to select element
    selectElement.getCountryCode = function() {
        return currentCountryCode;
    };
}

