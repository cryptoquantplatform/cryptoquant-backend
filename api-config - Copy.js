// API Configuration
// Change this to your backend URL when deployed
const API_URL = 'https://cryptoquant-api.onrender.com/api';

// API Helper Functions
const api = {
    // Get auth token from localStorage or sessionStorage
    getToken() {
        return localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('authToken');
    },

    // Set auth token
    setToken(token, remember = true) {
        if (remember) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
    },

    // Remove auth token (clear ALL storage)
    removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('user');
    },

    // Make API request
    async request(endpoint, options = {}) {
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;
            const response = await fetch(url, config);
            
            // Try to parse as JSON, fallback to text
            let data;
            const contentType = response.headers.get('content-type');
            
            try {
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    // If text looks like JSON, parse it
                    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                        data = JSON.parse(text);
                    } else {
                        // Plain text error
                        data = { success: false, message: text };
                    }
                }
            } catch (parseError) {
                // If JSON parse fails, use text
                data = { success: false, message: 'Invalid server response' };
            }

            if (!response.ok) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    // POST request
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // PUT request
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },

    // Logout
    logout() {
        this.removeToken();
        window.location.href = 'login.html';
    },

    // Clear token (alias for compatibility)
    clearToken() {
        this.removeToken();
    }
};

// Make api globally available
window.api = api;
window.API_URL = API_URL;
window.API_BASE_URL = API_URL; // Alias for compatibility

// Global logout function (callable from anywhere)
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        api.removeToken();
        window.location.href = 'login.html';
    }
}

