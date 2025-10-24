const axios = require('axios');

// ==========================================
// FREE PROXY MANAGER
// Automatically fetches and rotates free proxies
// ==========================================

class FreeProxyManager {
    constructor() {
        this.proxies = [];
        this.currentIndex = 0;
        this.lastUpdate = null;
        this.updateInterval = 30 * 60 * 1000; // Update every 30 minutes
    }

    // Fetch free proxies from multiple sources
    async fetchFreeProxies() {
        console.log('🔍 Fetching free proxies...');
        const allProxies = [];

        // Source 1: ProxyScrape API
        try {
            const response = await axios.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all', {
                timeout: 15000
            });
            
            if (response.data) {
                const proxies = response.data.split('\n')
                    .filter(p => p.trim())
                    .map(p => `http://${p.trim()}`);
                allProxies.push(...proxies);
                console.log(`✅ ProxyScrape: ${proxies.length} proxies`);
            }
        } catch (error) {
            console.log('⚠️ ProxyScrape failed:', error.message);
        }

        // Source 2: GitHub proxy list (geonode)
        try {
            const response = await axios.get('https://proxylist.geonode.com/api/proxy-list?limit=100&page=1&sort_by=lastChecked&sort_type=desc&protocols=http%2Chttps', {
                timeout: 15000
            });
            
            if (response.data && response.data.data) {
                const proxies = response.data.data.map(p => `http://${p.ip}:${p.port}`);
                allProxies.push(...proxies);
                console.log(`✅ Geonode: ${proxies.length} proxies`);
            }
        } catch (error) {
            console.log('⚠️ Geonode failed:', error.message);
        }

        // Source 3: Free-Proxy-List.net API
        try {
            const response = await axios.get('https://www.proxy-list.download/api/v1/get?type=http', {
                timeout: 15000
            });
            
            if (response.data) {
                const proxies = response.data.split('\n')
                    .filter(p => p.trim())
                    .map(p => `http://${p.trim()}`);
                allProxies.push(...proxies);
                console.log(`✅ Proxy-List: ${proxies.length} proxies`);
            }
        } catch (error) {
            console.log('⚠️ Proxy-List failed:', error.message);
        }

        // Remove duplicates
        const uniqueProxies = [...new Set(allProxies)];
        console.log(`📊 Total unique proxies: ${uniqueProxies.length}`);

        return uniqueProxies;
    }

    // Test if a proxy is working
    async testProxy(proxy) {
        try {
            const { HttpsProxyAgent } = require('https-proxy-agent');
            const agent = new HttpsProxyAgent(proxy);
            
            // Test with a simple API call
            const response = await axios.get('https://api.ipify.org?format=json', {
                httpsAgent: agent,
                httpAgent: agent,
                timeout: 5000
            });
            
            if (response.data && response.data.ip) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // Update proxy list
    async updateProxies() {
        const now = Date.now();
        
        // Only update if needed
        if (this.lastUpdate && (now - this.lastUpdate) < this.updateInterval) {
            return;
        }

        console.log('🔄 Updating free proxy list...');
        const fetchedProxies = await this.fetchFreeProxies();

        if (fetchedProxies.length === 0) {
            console.log('⚠️ No free proxies found, using direct connection');
            this.proxies = [];
            return;
        }

        // Test proxies (test first 20 to save time)
        console.log('🧪 Testing proxies...');
        const workingProxies = [];
        const proxyBatch = fetchedProxies.slice(0, 30); // Test first 30

        for (let i = 0; i < proxyBatch.length; i++) {
            const proxy = proxyBatch[i];
            const works = await this.testProxy(proxy);
            
            if (works) {
                workingProxies.push(proxy);
                console.log(`✅ Working proxy ${workingProxies.length}: ${proxy}`);
                
                // Stop after finding 10 working proxies
                if (workingProxies.length >= 10) {
                    break;
                }
            }
            
            // Add small delay between tests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (workingProxies.length > 0) {
            this.proxies = workingProxies;
            this.lastUpdate = now;
            console.log(`✅ ${workingProxies.length} working proxies ready!`);
        } else {
            console.log('⚠️ No working proxies found, using direct connection');
            this.proxies = [];
        }
    }

    // Get next proxy in rotation
    getNextProxy() {
        if (this.proxies.length === 0) {
            return null; // No proxies available
        }

        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        
        return proxy;
    }

    // Get axios config with proxy
    getAxiosConfig(timeout = 10000) {
        const config = { timeout };
        const proxy = this.getNextProxy();
        
        if (proxy) {
            const { HttpsProxyAgent } = require('https-proxy-agent');
            config.httpsAgent = new HttpsProxyAgent(proxy);
            config.httpAgent = new HttpsProxyAgent(proxy);
            console.log(`🔄 Using free proxy: ${proxy.substring(0, 30)}...`);
        }
        
        return config;
    }

    // Get current proxy count
    getProxyCount() {
        return this.proxies.length;
    }
}

// Singleton instance
const freeProxyManager = new FreeProxyManager();

// Auto-update on startup
freeProxyManager.updateProxies().catch(err => {
    console.log('⚠️ Initial proxy update failed:', err.message);
});

// Auto-update every 30 minutes
setInterval(() => {
    freeProxyManager.updateProxies().catch(err => {
        console.log('⚠️ Proxy update failed:', err.message);
    });
}, 30 * 60 * 1000);

module.exports = freeProxyManager;









