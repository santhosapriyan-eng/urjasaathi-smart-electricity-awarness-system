// UrjaSaathi - Appliance Management Module
// Handles appliance control, scheduling, and power monitoring

class ApplianceManager {
    constructor() {
        this.appliances = [];
        this.categories = [
            'All',
            'Cooling',
            'Lighting',
            'Kitchen',
            'Entertainment',
            'Heating',
            'Utility'
        ];
        
        this.schedules = [];
        this.init();
    }

    async init() {
        await this.loadApplianceData();
        this.setupEventListeners();
        this.startPowerMonitoring();
        this.loadSchedules();
    }

    async loadApplianceData() {
        try {
            // Try to load from local storage first
            const savedAppliances = localStorage.getItem('urjasaathi_appliances');
            
            if (savedAppliances) {
                this.appliances = JSON.parse(savedAppliances);
            } else {
                // Load default appliances
                this.appliances = await this.getDefaultAppliances();
                this.saveToStorage();
            }
            
            // Update UI if on appliances page
            if (window.location.pathname.includes('appliances.html')) {
                this.renderApplianceGrid();
                this.renderCategoryFilters();
            }
            
        } catch (error) {
            console.error('Failed to load appliance data:', error);
            this.appliances = await this.getDefaultAppliances();
        }
    }

    async getDefaultAppliances() {
        return [
            {
                id: 1,
                name: 'Air Conditioner',
                icon: '❄️',
                category: 'cooling',
                power: 1500, // Watts
                voltage: 230,
                status: 'on',
                usage: {
                    today: 4.2, // kWh
                    weekly: 29.4,
                    monthly: 126
                },
                cost: {
                    today: 315, // ₹
                    weekly: 2205,
                    monthly: 9450
                },
                schedule: null,
                efficiency: 'B',
                lastUsed: new Date().toISOString(),
                location: 'Living Room',
                controllable: true
            },
            {
                id: 2,
                name: 'Refrigerator',
                icon: '🧊',
                category: 'kitchen',
                power: 150,
                voltage: 230,
                status: 'on',
                usage: {
                    today: 2.1,
                    weekly: 14.7,
                    monthly: 63
                },
                cost: {
                    today: 157,
                    weekly: 1102,
                    monthly: 4725
                },
                schedule: null,
                efficiency: 'A++',
                lastUsed: new Date().toISOString(),
                location: 'Kitchen',
                controllable: false
            },
            {
                id: 3,
                name: 'Water Heater',
                icon: '🔥',
                category: 'heating',
                power: 2000,
                voltage: 230,
                status: 'off',
                usage: {
                    today: 0,
                    weekly: 3.5,
                    monthly: 15
                },
                cost: {
                    today: 0,
                    weekly: 262,
                    monthly: 1125
                },
                schedule: {
                    enabled: true,
                    times: ['06:00', '19:00'],
                    duration: 30
                },
                efficiency: 'B',
                lastUsed: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                location: 'Bathroom',
                controllable: true
            },
            {
                id: 4,
                name: 'LED Lights',
                icon: '💡',
                category: 'lighting',
                power: 100,
                voltage: 230,
                status: 'on',
                usage: {
                    today: 1.5,
                    weekly: 10.5,
                    monthly: 45
                },
                cost: {
                    today: 112,
                    weekly: 787,
                    monthly: 3375
                },
                schedule: {
                    enabled: true,
                    times: ['18:00', '23:00'],
                    sunset: true
                },
                efficiency: 'A+',
                lastUsed: new Date().toISOString(),
                location: 'All Rooms',
                controllable: true
            },
            {
                id: 5,
                name: 'TV & Entertainment',
                icon: '📺',
                category: 'entertainment',
                power: 200,
                voltage: 230,
                status: 'on',
                usage: {
                    today: 2.8,
                    weekly: 19.6,
                    monthly: 84
                },
                cost: {
                    today: 210,
                    weekly: 1470,
                    monthly: 6300
                },
                schedule: null,
                efficiency: 'B',
                lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                location: 'Living Room',
                controllable: true
            },
            {
                id: 6,
                name: 'Washing Machine',
                icon: '🧺',
                category: 'utility',
                power: 500,
                voltage: 230,
                status: 'off',
                usage: {
                    today: 0,
                    weekly: 2.5,
                    monthly: 10
                },
                cost: {
                    today: 0,
                    weekly: 187,
                    monthly: 750
                },
                schedule: {
                    enabled: true,
                    days: ['Saturday', 'Sunday'],
                    time: '10:00'
                },
                efficiency: 'A++',
                lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Utility Area',
                controllable: true
            },
            {
                id: 7,
                name: 'Computer',
                icon: '💻',
                category: 'office',
                power: 300,
                voltage: 230,
                status: 'on',
                usage: {
                    today: 2.4,
                    weekly: 16.8,
                    monthly: 72
                },
                cost: {
                    today: 180,
                    weekly: 1260,
                    monthly: 5400
                },
                schedule: {
                    enabled: true,
                    times: ['09:00', '18:00'],
                    weekdays: true
                },
                efficiency: 'B+',
                lastUsed: new Date().toISOString(),
                location: 'Home Office',
                controllable: true
            },
            {
                id: 8,
                name: 'Ceiling Fans',
                icon: '🌀',
                category: 'cooling',
                power: 75,
                voltage: 230,
                status: 'on',
                usage: {
                    today: 1.8,
                    weekly: 12.6,
                    monthly: 54
                },
                cost: {
                    today: 135,
                    weekly: 945,
                    monthly: 4050
                },
                schedule: null,
                efficiency: 'A',
                lastUsed: new Date().toISOString(),
                location: 'Bedrooms',
                controllable: true
            },
            {
                id: 9,
                name: 'Microwave Oven',
                icon: '🍳',
                category: 'kitchen',
                power: 1200,
                voltage: 230,
                status: 'off',
                usage: {
                    today: 0.3,
                    weekly: 2.1,
                    monthly: 9
                },
                cost: {
                    today: 22,
                    weekly: 157,
                    monthly: 675
                },
                schedule: null,
                efficiency: 'B',
                lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                location: 'Kitchen',
                controllable: true
            },
            {
                id: 10,
                name: 'Internet Router',
                icon: '📡',
                category: 'utility',
                power: 15,
                voltage: 230,
                status: 'on',
                usage: {
                    today: 0.36,
                    weekly: 2.52,
                    monthly: 10.8
                },
                cost: {
                    today: 27,
                    weekly: 189,
                    monthly: 810
                },
                schedule: null,
                efficiency: 'A+',
                lastUsed: new Date().toISOString(),
                location: 'Living Room',
                controllable: false
            }
        ];
    }

    setupEventListeners() {
        // Delegate appliance toggle events
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('appliance-toggle')) {
                this.toggleAppliance(e.target);
            }
        });

        // Add new appliance button
        const addBtn = document.getElementById('addApplianceBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddApplianceModal());
        }

        // Category filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-filter')) {
                this.filterByCategory(e.target.dataset.category);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('applianceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchAppliances(e.target.value);
            });
        }

        // Schedule modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('schedule-btn')) {
                const applianceId = e.target.dataset.id;
                this.showScheduleModal(applianceId);
            }
        });

        // Save schedule
        const saveScheduleBtn = document.getElementById('saveSchedule');
        if (saveScheduleBtn) {
            saveScheduleBtn.addEventListener('click', () => this.saveSchedule());
        }
    }

    renderApplianceGrid() {
        const grid = document.getElementById('applianceGrid');
        if (!grid) return;

        grid.innerHTML = this.appliances.map(appliance => `
            <div class="appliance-card" data-category="${appliance.category}" data-id="${appliance.id}">
                <div class="appliance-card-header">
                    <div class="appliance-icon-large">${appliance.icon}</div>
                    <div class="appliance-card-title">
                        <h4>${appliance.name}</h4>
                        <span class="appliance-location">${appliance.location}</span>
                    </div>
                    <div class="appliance-efficiency">
                        <span class="efficiency-badge ${appliance.efficiency.toLowerCase()}">
                            ${appliance.efficiency}
                        </span>
                    </div>
                </div>
                
                <div class="appliance-stats">
                    <div class="stat">
                        <span class="stat-label">Power</span>
                        <span class="stat-value">${appliance.power}W</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Today</span>
                        <span class="stat-value">${appliance.usage.today} kWh</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Cost</span>
                        <span class="stat-value">₹${appliance.cost.today}</span>
                    </div>
                </div>
                
                <div class="appliance-controls">
                    <div class="status-indicator ${appliance.status}">
                        <span class="status-dot ${appliance.status}"></span>
                        <span>${appliance.status === 'on' ? 'ON' : 'OFF'}</span>
                    </div>
                    
                    ${appliance.controllable ? `
                        <label class="toggle-switch">
                            <input type="checkbox" class="appliance-toggle" 
                                   ${appliance.status === 'on' ? 'checked' : ''}
                                   data-id="${appliance.id}">
                            <span class="toggle-slider"></span>
                        </label>
                        
                        <button class="btn-icon schedule-btn" data-id="${appliance.id}" title="Schedule">
                            ⏰
                        </button>
                        
                        <button class="btn-icon details-btn" data-id="${appliance.id}" title="Details">
                            ℹ️
                        </button>
                    ` : `
                        <span class="uncontrollable-label">Auto</span>
                    `}
                </div>
                
                ${appliance.schedule ? `
                    <div class="appliance-schedule">
                        <span class="schedule-icon">⏰</span>
                        <span class="schedule-info">
                            ${this.formatSchedule(appliance.schedule)}
                        </span>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    renderCategoryFilters() {
        const filterContainer = document.querySelector('.category-filters');
        if (!filterContainer) return;

        filterContainer.innerHTML = this.categories.map(category => `
            <button class="category-filter ${category === 'All' ? 'active' : ''}" 
                    data-category="${category.toLowerCase()}">
                ${category}
            </button>
        `).join('');
    }

    filterByCategory(category) {
        // Update active filter
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Filter appliances
        const applianceCards = document.querySelectorAll('.appliance-card');
        applianceCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchAppliances(query) {
        const searchTerm = query.toLowerCase().trim();
        const applianceCards = document.querySelectorAll('.appliance-card');
        
        applianceCards.forEach(card => {
            const name = card.querySelector('h4').textContent.toLowerCase();
            const location = card.querySelector('.appliance-location').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || location.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    toggleAppliance(checkbox) {
        const applianceId = parseInt(checkbox.dataset.id);
        const appliance = this.appliances.find(a => a.id === applianceId);
        
        if (!appliance) return;
        
        const newStatus = checkbox.checked ? 'on' : 'off';
        
        // Update appliance
        appliance.status = newStatus;
        appliance.lastUsed = new Date().toISOString();
        
        // Update UI
        const card = checkbox.closest('.appliance-card');
        const statusIndicator = card.querySelector('.status-indicator');
        const statusDot = card.querySelector('.status-dot');
        
        statusIndicator.classList.remove('on', 'off');
        statusIndicator.classList.add(newStatus);
        statusDot.classList.remove('on', 'off');
        statusDot.classList.add(newStatus);
        
        // Update status text
        const statusText = statusIndicator.querySelector('span:last-child');
        if (statusText) {
            statusText.textContent = newStatus === 'on' ? 'ON' : 'OFF';
        }
        
        // Update main dashboard if it exists
        this.updateMainDashboard();
        
        // Save changes
        this.saveToStorage();
        
        // Show notification
        this.showNotification(
            `${appliance.name} turned ${newStatus === 'on' ? 'ON' : 'OFF'}`,
            newStatus === 'on' ? 'warning' : 'success'
        );
        
        // Log for analytics
        this.logApplianceEvent(appliance, newStatus);
    }

    updateMainDashboard() {
        // Update the appliances list in main dashboard
        if (window.UrjaSaathi && window.UrjaSaathi.renderAppliances) {
            window.UrjaSaathi.renderAppliances();
        }
    }

    showAddApplianceModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal active" id="addApplianceModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Appliance</h3>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="applianceForm">
                            <div class="form-group">
                                <label for="applianceName">Appliance Name</label>
                                <input type="text" id="applianceName" required 
                                       placeholder="e.g., Air Conditioner, Refrigerator">
                            </div>
                            
                            <div class="form-group">
                                <label for="applianceCategory">Category</label>
                                <select id="applianceCategory" required>
                                    <option value="">Select Category</option>
                                    <option value="cooling">Cooling</option>
                                    <option value="kitchen">Kitchen</option>
                                    <option value="lighting">Lighting</option>
                                    <option value="heating">Heating</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="utility">Utility</option>
                                    <option value="office">Office</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="appliancePower">Power Rating (Watts)</label>
                                <input type="number" id="appliancePower" required 
                                       min="1" max="10000" step="1" value="100">
                                <div class="input-hint">Typical: Bulb (10-100W), Fan (50-100W), AC (1000-2000W)</div>
                            </div>
                            
                            <div class="form-group">
                                <label for="applianceLocation">Location</label>
                                <input type="text" id="applianceLocation" 
                                       placeholder="e.g., Living Room, Kitchen">
                            </div>
                            
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="applianceControllable" checked>
                                    Controllable via App
                                </label>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancelAdd">Cancel</button>
                                <button type="submit" class="btn-primary">Add Appliance</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup form submission
        const form = document.getElementById('applianceForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddAppliance(form);
        });
        
        // Setup cancel button
        document.getElementById('cancelAdd').addEventListener('click', () => {
            document.getElementById('addApplianceModal').remove();
        });
        
        // Setup close button
        document.querySelector('#addApplianceModal .modal-close').addEventListener('click', () => {
            document.getElementById('addApplianceModal').remove();
        });
    }

    handleAddAppliance(form) {
        const formData = new FormData(form);
        const name = formData.get('applianceName');
        const category = formData.get('applianceCategory');
        const power = parseInt(formData.get('appliancePower'));
        const location = formData.get('applianceLocation') || 'Unknown';
        const controllable = document.getElementById('applianceControllable').checked;
        
        // Generate unique ID
        const newId = Math.max(...this.appliances.map(a => a.id)) + 1;
        
        // Get icon based on category
        const icon = this.getIconForCategory(category);
        
        // Create new appliance
        const newAppliance = {
            id: newId,
            name: name,
            icon: icon,
            category: category,
            power: power,
            voltage: 230,
            status: 'off',
            usage: {
                today: 0,
                weekly: 0,
                monthly: 0
            },
            cost: {
                today: 0,
                weekly: 0,
                monthly: 0
            },
            schedule: null,
            efficiency: this.calculateEfficiency(power, category),
            lastUsed: new Date().toISOString(),
            location: location,
            controllable: controllable
        };
        
        // Add to appliances array
        this.appliances.push(newAppliance);
        
        // Save to storage
        this.saveToStorage();
        
        // Update UI
        this.renderApplianceGrid();
        
        // Close modal
        document.getElementById('addApplianceModal').remove();
        
        // Show success notification
        this.showNotification(`${name} added successfully!`, 'success');
    }

    getIconForCategory(category) {
        const icons = {
            cooling: '❄️',
            kitchen: '🍳',
            lighting: '💡',
            heating: '🔥',
            entertainment: '📺',
            utility: '🔧',
            office: '💻'
        };
        return icons[category] || '🔌';
    }

    calculateEfficiency(power, category) {
        // Simple efficiency calculation based on power and category
        if (power < 100) return 'A++';
        if (power < 500) return 'A+';
        if (power < 1000) return 'A';
        if (power < 2000) return 'B';
        return 'C';
    }

    showScheduleModal(applianceId) {
        const appliance = this.appliances.find(a => a.id === parseInt(applianceId));
        if (!appliance) return;
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal active" id="scheduleModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Schedule ${appliance.name}</h3>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="scheduleForm">
                            <input type="hidden" id="scheduledApplianceId" value="${applianceId}">
                            
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="enableSchedule" 
                                           ${appliance.schedule ? 'checked' : ''}>
                                    Enable Scheduling
                                </label>
                            </div>
                            
                            <div id="scheduleOptions" style="${appliance.schedule ? '' : 'display: none;'}">
                                <div class="form-group">
                                    <label>Schedule Type</label>
                                    <select id="scheduleType">
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>Start Time</label>
                                    <input type="time" id="scheduleStartTime" 
                                           value="${appliance.schedule?.times?.[0] || '08:00'}">
                                </div>
                                
                                <div class="form-group">
                                    <label>End Time (Optional)</label>
                                    <input type="time" id="scheduleEndTime" 
                                           value="${appliance.schedule?.times?.[1] || ''}">
                                </div>
                                
                                <div id="weeklyOptions" style="display: none;">
                                    <div class="form-group">
                                        <label>Days of Week</label>
                                        <div class="day-selector">
                                            ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `
                                                <label class="day-checkbox">
                                                    <input type="checkbox" value="${day}">
                                                    ${day}
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" id="cancelSchedule">Cancel</button>
                                <button type="submit" class="btn-primary">Save Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup form interaction
        const enableSchedule = document.getElementById('enableSchedule');
        const scheduleOptions = document.getElementById('scheduleOptions');
        
        enableSchedule.addEventListener('change', (e) => {
            scheduleOptions.style.display = e.target.checked ? 'block' : 'none';
        });
        
        // Schedule type change
        const scheduleType = document.getElementById('scheduleType');
        const weeklyOptions = document.getElementById('weeklyOptions');
        
        scheduleType.addEventListener('change', (e) => {
            weeklyOptions.style.display = e.target.value === 'weekly' ? 'block' : 'none';
        });
        
        // Form submission
        const form = document.getElementById('scheduleForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSchedule(form, appliance);
        });
        
        // Setup cancel button
        document.getElementById('cancelSchedule').addEventListener('click', () => {
            document.getElementById('scheduleModal').remove();
        });
        
        // Setup close button
        document.querySelector('#scheduleModal .modal-close').addEventListener('click', () => {
            document.getElementById('scheduleModal').remove();
        });
    }

    saveSchedule(form, appliance) {
        const formData = new FormData(form);
        const applianceId = parseInt(formData.get('scheduledApplianceId'));
        const enabled = document.getElementById('enableSchedule').checked;
        
        if (!enabled) {
            // Remove schedule
            appliance.schedule = null;
        } else {
            const scheduleType = document.getElementById('scheduleType').value;
            const startTime = document.getElementById('scheduleStartTime').value;
            const endTime = document.getElementById('scheduleEndTime').value;
            
            const schedule = {
                enabled: true,
                type: scheduleType
            };
            
            if (startTime) {
                schedule.startTime = startTime;
            }
            
            if (endTime) {
                schedule.endTime = endTime;
            }
            
            if (scheduleType === 'weekly') {
                const days = Array.from(document.querySelectorAll('.day-checkbox input:checked'))
                    .map(cb => cb.value);
                schedule.days = days;
            }
            
            appliance.schedule = schedule;
        }
        
        // Save changes
        this.saveToStorage();
        
        // Update UI
        this.renderApplianceGrid();
        
        // Close modal
        document.getElementById('scheduleModal').remove();
        
        // Show notification
        this.showNotification(
            `Schedule ${enabled ? 'saved' : 'removed'} for ${appliance.name}`,
            'success'
        );
    }

    formatSchedule(schedule) {
        if (!schedule) return 'No schedule';
        
        if (schedule.times) {
            return `Daily at ${schedule.times.join(', ')}`;
        }
        
        if (schedule.days && schedule.time) {
            return `${schedule.days.join(', ')} at ${schedule.time}`;
        }
        
        return 'Scheduled';
    }

    startPowerMonitoring() {
        // Monitor appliance power consumption
        setInterval(() => {
            this.updateApplianceUsage();
        }, 30000); // Every 30 seconds
    }

    updateApplianceUsage() {
        const now = new Date();
        const hour = now.getHours();
        
        this.appliances.forEach(appliance => {
            if (appliance.status === 'on') {
                // Calculate usage for this interval
                const hours = 0.5 / 60; // 30 seconds in hours
                const kWh = (appliance.power * hours) / 1000;
                const cost = kWh * 7.5; // ₹7.5 per kWh
                
                // Update today's usage
                appliance.usage.today += kWh;
                appliance.cost.today += cost;
                
                // Peak hour adjustment
                if (hour >= 18 && hour <= 22) {
                    // 20% higher cost during peak hours
                    appliance.cost.today += cost * 0.2;
                }
                
                // Round to 2 decimal places
                appliance.usage.today = parseFloat(appliance.usage.today.toFixed(2));
                appliance.cost.today = parseFloat(appliance.cost.today.toFixed(0));
            }
        });
        
        // Save updated data
        this.saveToStorage();
        
        // Update UI if on appliances page
        if (window.location.pathname.includes('appliances.html')) {
            this.updateApplianceCards();
        }
    }

    updateApplianceCards() {
        document.querySelectorAll('.appliance-card').forEach(card => {
            const applianceId = parseInt(card.dataset.id);
            const appliance = this.appliances.find(a => a.id === applianceId);
            
            if (appliance) {
                const usageElement = card.querySelector('.stat:nth-child(2) .stat-value');
                const costElement = card.querySelector('.stat:nth-child(3) .stat-value');
                
                if (usageElement) {
                    usageElement.textContent = `${appliance.usage.today} kWh`;
                }
                
                if (costElement) {
                    costElement.textContent = `₹${appliance.cost.today}`;
                }
            }
        });
    }

    loadSchedules() {
        // Load saved schedules from local storage
        const savedSchedules = localStorage.getItem('urjasaathi_schedules');
        if (savedSchedules) {
            this.schedules = JSON.parse(savedSchedules);
        }
        
        // Check and execute schedules
        setInterval(() => {
            this.checkSchedules();
        }, 60000); // Every minute
    }

    checkSchedules() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
        
        this.appliances.forEach(appliance => {
            if (appliance.schedule?.enabled) {
                const schedule = appliance.schedule;
                
                // Check if it's time to turn on/off
                if (schedule.startTime === currentTime) {
                    if (appliance.status !== 'on') {
                        this.executeSchedule(appliance, 'on');
                    }
                }
                
                if (schedule.endTime === currentTime) {
                    if (appliance.status !== 'off') {
                        this.executeSchedule(appliance, 'off');
                    }
                }
                
                // Check weekly schedules
                if (schedule.days?.includes(currentDay) && schedule.time === currentTime) {
                    const targetState = schedule.action || 'toggle';
                    this.executeSchedule(appliance, targetState);
                }
            }
        });
    }

    executeSchedule(appliance, action) {
        // Find the toggle checkbox for this appliance
        const checkbox = document.querySelector(`.appliance-toggle[data-id="${appliance.id}"]`);
        
        if (checkbox) {
            if (action === 'on' && !checkbox.checked) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            } else if (action === 'off' && checkbox.checked) {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event('change'));
            } else if (action === 'toggle') {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }

    logApplianceEvent(appliance, action) {
        const log = {
            timestamp: new Date().toISOString(),
            applianceId: appliance.id,
            applianceName: appliance.name,
            action: action,
            power: appliance.power
        };
        
        // Save to local storage
        const logs = JSON.parse(localStorage.getItem('urjasaathi_logs') || '[]');
        logs.push(log);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.shift();
        }
        
        localStorage.setItem('urjasaathi_logs', JSON.stringify(logs));
    }

    saveToStorage() {
        localStorage.setItem('urjasaathi_appliances', JSON.stringify(this.appliances));
    }

    showNotification(message, type = 'info') {
        if (window.UrjaSaathi && window.UrjaSaathi.showNotification) {
            window.UrjaSaathi.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`${type}: ${message}`);
        }
    }

    // Export appliance data
    exportData(format = 'json') {
        const data = {
            appliances: this.appliances,
            exportedAt: new Date().toISOString()
        };
        
        if (format === 'csv') {
            return this.convertToCSV(data);
        }
        
        return JSON.stringify(data, null, 2);
    }

    convertToCSV(data) {
        const headers = ['Name', 'Category', 'Power (W)', 'Status', 'Today Usage (kWh)', 'Today Cost (₹)'];
        const rows = data.appliances.map(app => [
            app.name,
            app.category,
            app.power,
            app.status,
            app.usage.today,
            app.cost.today
        ]);
        
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }
}

// Initialize appliance manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ApplianceManager = new ApplianceManager();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApplianceManager };
}