// UrjaSaathi - Main Application JavaScript
// ES6+ Module Architecture

// Application State
const AppState = {
    user: {
        name: 'Amit Sharma',
        location: 'Delhi, India',
        tariff: 7.5, // ₹ per kWh
        currency: '₹'
    },
    consumption: {
        current: 1.4, // kW
        today: 28.4, // kWh
        monthly: 340, // kWh
        peakHours: [18, 19, 20, 21]
    },
    appliances: [],
    isOnline: true,
    theme: 'light',
    notifications: []
};

// DOM Elements Cache
const DOM = {
    loadingScreen: document.getElementById('loadingScreen'),
    progressBar: document.getElementById('progressBar'),
    loadingMessage: document.getElementById('loadingMessage'),
    currentUsage: document.getElementById('currentUsage'),
    todayCost: document.getElementById('todayCost'),
    solarGen: document.getElementById('solarGen'),
    monthlySavings: document.getElementById('monthlySavings'),
    appliancesList: document.getElementById('appliancesList'),
    energyViz: document.getElementById('energyViz'),
    demoBtn: document.getElementById('demoBtn'),
    demoModal: document.getElementById('demoModal'),
    voiceBtn: document.getElementById('voiceBtn'),
    installBtn: document.getElementById('installBtn'),
    refreshChart: document.getElementById('refreshChart'),
    navToggle: document.querySelector('.nav-toggle'),
    navMenu: document.querySelector('.nav-menu')
};

// Application Initialization
class UrjaSaathiApp {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Initialize core components
            await this.loadAppData();
            this.setupEventListeners();
            this.startRealTimeUpdates();
            this.initOfflineDetection();
            this.updateLiveData();
            
            // Mark app as ready
            setTimeout(() => {
                document.documentElement.classList.add('app-ready');
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async loadAppData() {
        // Load appliances data
        const appliances = [
            {
                id: 1,
                name: 'Air Conditioner',
                icon: '❄️',
                type: 'cooling',
                power: 1500,
                status: 'on',
                usage: '4.2 kWh',
                cost: '₹315',
                lastUsed: '2 hours ago'
            },
            {
                id: 2,
                name: 'Refrigerator',
                icon: '🧊',
                type: 'kitchen',
                power: 150,
                status: 'on',
                usage: '2.1 kWh',
                cost: '₹157',
                lastUsed: 'Now'
            },
            {
                id: 3,
                name: 'Water Heater',
                icon: '🔥',
                type: 'heating',
                power: 2000,
                status: 'off',
                usage: '0 kWh',
                cost: '₹0',
                lastUsed: '12 hours ago'
            },
            {
                id: 4,
                name: 'LED Lights',
                icon: '💡',
                type: 'lighting',
                power: 100,
                status: 'on',
                usage: '1.5 kWh',
                cost: '₹112',
                lastUsed: 'Now'
            },
            {
                id: 5,
                name: 'TV & Entertainment',
                icon: '📺',
                type: 'entertainment',
                power: 200,
                status: 'on',
                usage: '2.8 kWh',
                cost: '₹210',
                lastUsed: '30 mins ago'
            }
        ];

        AppState.appliances = appliances;
        this.renderAppliances();
        this.renderLeaderboard();
    }

    setupEventListeners() {
        // Navigation toggle
        if (DOM.navToggle && DOM.navMenu) {
            DOM.navToggle.addEventListener('click', () => {
                const isExpanded = DOM.navToggle.getAttribute('aria-expanded') === 'true';
                DOM.navToggle.setAttribute('aria-expanded', !isExpanded);
                DOM.navMenu.classList.toggle('active');
            });
        }

        // Demo button
        if (DOM.demoBtn) {
            DOM.demoBtn.addEventListener('click', () => this.showDemoModal());
        }

        // Voice command button
        if (DOM.voiceBtn) {
            DOM.voiceBtn.addEventListener('click', () => this.startVoiceCommand());
        }

        // Install PWA button
        if (DOM.installBtn) {
            DOM.installBtn.addEventListener('click', () => this.installPWA());
        }

        // Chart refresh button
        if (DOM.refreshChart) {
            DOM.refreshChart.addEventListener('click', () => this.refreshChartData());
        }

        // Close modal on click outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => this.hideModal(modal));
            }
        });

        // Close buttons in modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });

        // Toggle switches for appliances
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('appliance-toggle')) {
                this.toggleAppliance(e.target);
            }
        });

        // Metric toggle buttons
        document.querySelectorAll('[data-metric]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMetric(e.target);
            });
        });

        // Online/offline detection
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    renderAppliances() {
        if (!DOM.appliancesList) return;

        const appliancesHTML = AppState.appliances.map(appliance => `
            <div class="appliance-item" data-id="${appliance.id}">
                <div class="appliance-info">
                    <div class="appliance-icon">${appliance.icon}</div>
                    <div class="appliance-details">
                        <h4>${appliance.name}</h4>
                        <p>${appliance.power}W • ${appliance.usage} • ${appliance.cost}</p>
                    </div>
                </div>
                <div class="appliance-status">
                    <div class="status-indicator ${appliance.status}">
                        <span class="status-dot ${appliance.status}"></span>
                        <span>${appliance.status === 'on' ? 'ON' : 'OFF'}</span>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" class="appliance-toggle" 
                               ${appliance.status === 'on' ? 'checked' : ''}
                               data-id="${appliance.id}"
                               aria-label="Toggle ${appliance.name}">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `).join('');

        DOM.appliancesList.innerHTML = appliancesHTML;
    }

    renderLeaderboard() {
        const leaderboard = [
            { rank: 1, name: 'Priya Patel', savings: '₹2,450', efficiency: '92%' },
            { rank: 2, name: 'Rajesh Kumar', savings: '₹1,980', efficiency: '88%' },
            { rank: 3, name: 'Sunita Reddy', savings: '₹1,750', efficiency: '85%' },
            { rank: 5, name: 'Vikram Singh', savings: '₹1,120', efficiency: '82%' }
        ];

        const leaderboardList = document.querySelector('.leaderboard-list');
        if (leaderboardList) {
            leaderboardList.innerHTML = leaderboard.map(user => `
                <div class="leaderboard-item">
                    <span class="rank-number">#${user.rank}</span>
                    <span class="rank-name">${user.name}</span>
                    <span class="rank-savings">${user.savings}</span>
                </div>
            `).join('');
        }
    }

    startRealTimeUpdates() {
        // Update consumption data every 5 seconds
        setInterval(() => {
            this.updateLiveData();
            this.updateChartData();
        }, 5000);

        // Update time-based elements every minute
        setInterval(() => {
            this.updateTimeElements();
        }, 60000);
    }

    updateLiveData() {
        // Generate realistic fluctuations
        const fluctuation = (Math.random() - 0.5) * 0.4; // ±0.2 kW
        const newConsumption = Math.max(0.8, Math.min(2.5, AppState.consumption.current + fluctuation));
        
        // Update state
        AppState.consumption.current = parseFloat(newConsumption.toFixed(1));
        
        // Calculate costs
        const hourlyCost = (AppState.consumption.current * AppState.user.tariff).toFixed(0);
        const dailyCost = (parseInt(hourlyCost) * 24 * 0.4).toFixed(0); // Assuming 40% active usage
        
        // Update DOM
        if (DOM.currentUsage) {
            DOM.currentUsage.textContent = `${AppState.consumption.current.toFixed(1)} kW`;
        }
        
        if (DOM.todayCost) {
            DOM.todayCost.textContent = dailyCost;
        }
        
        // Update solar generation (simulated)
        const currentHour = new Date().getHours();
        let solarOutput = 0;
        
        if (currentHour >= 6 && currentHour <= 18) {
            // Simulate solar curve
            const hourInDay = currentHour - 6;
            const normalizedHour = hourInDay / 12;
            solarOutput = Math.sin(normalizedHour * Math.PI) * 3.5;
        }
        
        if (DOM.solarGen) {
            DOM.solarGen.textContent = `${solarOutput.toFixed(1)} kWh`;
        }
        
        // Update savings (simulated)
        const baseSavings = 1250;
        const aiBonus = Math.floor(Math.random() * 100);
        const totalSavings = baseSavings + aiBonus;
        
        if (DOM.monthlySavings) {
            DOM.monthlySavings.textContent = totalSavings;
        }
        
        // Update environmental impact
        this.updateEnvironmentalImpact();
    }

    updateEnvironmentalImpact() {
        // Calculate based on savings
        const savings = parseInt(document.getElementById('monthlySavings')?.textContent || '1250');
        const treesSaved = Math.floor(savings / 30);
        const co2Reduced = (savings / 1000).toFixed(1);
        const waterSaved = savings * 6.72;
        
        // Update DOM
        const treesElement = document.getElementById('treesSaved');
        if (treesElement) {
            treesElement.textContent = treesSaved;
        }
        
        // Animate meter fill
        const meterFill = document.querySelector('.meter-fill');
        if (meterFill) {
            const efficiency = 75 + Math.floor(Math.random() * 10);
            meterFill.style.width = `${efficiency}%`;
            const meterValue = document.querySelector('.meter-value');
            if (meterValue) {
                meterValue.textContent = `${efficiency}%`;
            }
        }
    }

    updateChartData() {
        // This will be handled by charts.js
        if (window.UrjaSaathiCharts) {
            window.UrjaSaathiCharts.updateLiveData();
        }
    }

    updateTimeElements() {
        const timeElements = document.querySelectorAll('.card-time');
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        timeElements.forEach(el => {
            el.textContent = `Updated at ${timeString}`;
        });
    }

    toggleAppliance(checkbox) {
        const applianceId = parseInt(checkbox.dataset.id);
        const appliance = AppState.appliances.find(a => a.id === applianceId);
        
        if (appliance) {
            appliance.status = checkbox.checked ? 'on' : 'off';
            
            // Update UI
            const applianceItem = checkbox.closest('.appliance-item');
            const statusIndicator = applianceItem.querySelector('.status-indicator');
            const statusDot = applianceItem.querySelector('.status-dot');
            
            statusIndicator.classList.remove('on', 'off');
            statusIndicator.classList.add(appliance.status);
            statusDot.classList.remove('on', 'off');
            statusDot.classList.add(appliance.status);
            
            // Update status text
            const statusText = statusIndicator.querySelector('span:last-child');
            if (statusText) {
                statusText.textContent = appliance.status === 'on' ? 'ON' : 'OFF';
            }
            
            // Show notification
            this.showNotification(
                `${appliance.name} turned ${appliance.status === 'on' ? 'ON' : 'OFF'}`,
                appliance.status === 'on' ? 'warning' : 'success'
            );
            
            // Recalculate consumption
            this.recalculateConsumption();
        }
    }

    recalculateConsumption() {
        let totalPower = 0;
        AppState.appliances.forEach(appliance => {
            if (appliance.status === 'on') {
                totalPower += appliance.power;
            }
        });
        
        // Convert to kW
        AppState.consumption.current = totalPower / 1000;
        
        // Update display
        if (DOM.currentUsage) {
            DOM.currentUsage.textContent = `${AppState.consumption.current.toFixed(1)} kW`;
        }
    }

    switchMetric(button) {
        const buttons = document.querySelectorAll('[data-metric]');
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const metric = button.dataset.metric;
        
        // Update chart metric
        if (window.UrjaSaathiCharts) {
            window.UrjaSaathiCharts.switchMetric(metric);
        }
    }

    showDemoModal() {
        DOM.demoModal.classList.add('active');
        DOM.demoModal.removeAttribute('hidden');
        DOM.demoModal.setAttribute('aria-hidden', 'false');
    }

    hideModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.setAttribute('hidden', 'true');
                modal.setAttribute('aria-hidden', 'true');
            }, 300);
        }
    }

    async startVoiceCommand() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.showNotification('Voice commands not supported in your browser', 'error');
            return;
        }
        
        try {
            this.showNotification('Listening for command...', 'info');
            
            // In a real app, implement speech recognition here
            // For now, simulate a response
            setTimeout(() => {
                const commands = [
                    "Turned off living room lights",
                    "Showing solar calculator",
                    "Checking today's usage",
                    "Opening subsidy applications"
                ];
                const randomCommand = commands[Math.floor(Math.random() * commands.length)];
                this.showNotification(randomCommand, 'success');
            }, 1500);
            
        } catch (error) {
            console.error('Voice command error:', error);
            this.showNotification('Voice command failed', 'error');
        }
    }

    async installPWA() {
        // Check if beforeinstallprompt event has been fired
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            
            const { outcome } = await window.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                this.showNotification('UrjaSaathi installed successfully!', 'success');
            } else {
                this.showNotification('Installation cancelled', 'info');
            }
            
            window.deferredPrompt = null;
        } else {
            this.showNotification('Add to Home Screen option not available', 'info');
        }
    }

    refreshChartData() {
        if (window.UrjaSaathiCharts) {
            window.UrjaSaathiCharts.refresh();
            this.showNotification('Chart data refreshed', 'success');
        }
    }

    handleOnline() {
        AppState.isOnline = true;
        this.showNotification('Back online. Syncing data...', 'success');
        // Sync any pending offline data
        this.syncOfflineData();
    }

    handleOffline() {
        AppState.isOnline = false;
        this.showNotification('You are offline. Some features limited.', 'warning');
    }

    initOfflineDetection() {
        AppState.isOnline = navigator.onLine;
        
        if (!AppState.isOnline) {
            this.handleOffline();
        }
    }

    async syncOfflineData() {
        // In a real app, sync data from local storage
        console.log('Syncing offline data...');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
            <button class="notification-close" aria-label="Close notification">×</button>
        `;
        
        // Add to notification container or create one
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    showError(message) {
        this.showNotification(message, 'error');
        
        // Create error fallback UI
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-fallback';
        errorDiv.innerHTML = `
            <h3>Something went wrong</h3>
            <p>${message}</p>
            <button onclick="location.reload()">Reload Application</button>
        `;
        
        document.body.appendChild(errorDiv);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.UrjaSaathi = new UrjaSaathiApp();
});

// PWA Installation Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    
    // Show install button
    if (DOM.installBtn) {
        DOM.installBtn.style.display = 'flex';
    }
});

// Service Worker registration success
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(() => {
        console.log('Service Worker ready');
    });
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UrjaSaathiApp, AppState };
}