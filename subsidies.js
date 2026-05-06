// UrjaSaathi - Subsidies Module
// Handles government scheme portal functionality

class SubsidyManager {
    constructor() {
        this.schemes = [];
        this.userEligibility = {};
        this.applications = [];
        this.init();
    }

    async init() {
        await this.loadSchemesData();
        this.loadUserApplications();
        this.setupEventListeners();
        this.initializeCalculator();
        this.setupSchemeFilters();
    }

    async loadSchemesData() {
        try {
            // In a real app, this would be from an API
            this.schemes = [
                {
                    id: 'pm-surya-ghar',
                    name: 'PM Surya Ghar Yojana',
                    description: '300 units free electricity per month with rooftop solar installation. Central government scheme with 40-60% subsidy.',
                    amount: 78000,
                    type: 'solar',
                    government: 'central',
                    eligibility: {
                        incomeMax: 150000,
                        hasRooftop: true,
                        ownership: ['owned', 'joint']
                    },
                    benefits: [
                        'Up to 3kW system subsidy',
                        '300 free units/month',
                        'Net metering available',
                        '20-year performance warranty'
                    ],
                    deadline: '2025-03-31',
                    popularity: 95
                },
                {
                    id: 'ujala',
                    name: 'UJALA LED Scheme',
                    description: 'Energy-efficient LED bulbs at subsidized rates. Save 80% on lighting costs.',
                    amount: 70,
                    type: 'appliances',
                    government: 'central',
                    eligibility: {
                        incomeMax: 300000,
                        hasRooftop: false
                    },
                    benefits: [
                        '9W LED bulbs at ₹70',
                        '4 bulbs per family',
                        '1-year warranty',
                        'Available nationwide'
                    ],
                    deadline: null,
                    popularity: 88
                },
                {
                    id: 'solar-pump',
                    name: 'Solar Water Pump Scheme',
                    description: '90% subsidy on solar-powered irrigation pumps for farmers.',
                    amount: 300000,
                    type: 'solar',
                    government: 'state',
                    eligibility: {
                        isFarmer: true,
                        hasLand: true,
                        ownership: ['owned']
                    },
                    benefits: [
                        'Up to ₹3,00,000 subsidy',
                        '3HP, 5HP, 7.5HP options',
                        'Free maintenance for 5 years',
                        'Remote monitoring'
                    ],
                    deadline: '2024-12-31',
                    popularity: 72
                }
            ];

            this.renderSchemes();
        } catch (error) {
            console.error('Failed to load schemes:', error);
        }
    }

    loadUserApplications() {
        const savedApplications = localStorage.getItem('urjasaathi_applications');
        
        if (savedApplications) {
            this.applications = JSON.parse(savedApplications);
            this.renderApplicationTracker();
        } else {
            // Default applications
            this.applications = [
                {
                    id: 'APP-2024-789456',
                    schemeId: 'pm-surya-ghar',
                    status: 'approved',
                    submitted: '2024-11-15',
                    steps: [
                        { name: 'Application', status: 'completed', date: '2024-11-15' },
                        { name: 'Document Verification', status: 'completed', date: '2024-11-25' },
                        { name: 'Technical Inspection', status: 'pending', date: '2024-12-05' },
                        { name: 'Subsidy Disbursement', status: 'upcoming', date: '2024-12-20' }
                    ],
                    documents: [
                        { name: 'Aadhaar Card', status: 'completed' },
                        { name: 'PAN Card', status: 'completed' },
                        { name: 'Electricity Bill', status: 'pending' },
                        { name: 'Bank Passbook', status: 'upcoming' },
                        { name: 'Property Papers', status: 'upcoming' }
                    ]
                }
            ];
            
            this.saveApplications();
            this.renderApplicationTracker();
        }
    }

    renderSchemes() {
        const grid = document.getElementById('schemesGrid');
        if (!grid) return;

        grid.innerHTML = this.schemes.map(scheme => this.createSchemeCard(scheme)).join('');
    }

    createSchemeCard(scheme) {
        return `
            <div class="scheme-card" data-scheme="${scheme.type}" data-govt="${scheme.government}">
                ${scheme.popularity > 90 ? `
                    <div class="scheme-badge premium">
                        <span>🔥 Most Popular</span>
                    </div>
                ` : ''}
                
                <div class="scheme-icon">
                    ${this.getSchemeIcon(scheme.type)}
                </div>
                
                <div class="scheme-content">
                    <div class="scheme-header">
                        <h3>${scheme.name}</h3>
                        <span class="scheme-amount">
                            ${scheme.type === 'appliances' ? '₹' + scheme.amount : '₹' + scheme.amount.toLocaleString() + ' Subsidy'}
                        </span>
                    </div>
                    
                    <p class="scheme-description">
                        ${scheme.description}
                    </p>
                    
                    <div class="scheme-details">
                        <div class="detail">
                            <span class="detail-label">Benefit:</span>
                            <span class="detail-value">${this.getBenefitSummary(scheme)}</span>
                        </div>
                        <div class="detail">
                            <span class="detail-label">Deadline:</span>
                            <span class="detail-value">
                                ${scheme.deadline ? new Date(scheme.deadline).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                }) : 'Ongoing'}
                            </span>
                        </div>
                        <div class="detail">
                            <span class="detail-label">Eligibility:</span>
                            <span class="detail-value">${this.getEligibilitySummary(scheme)}</span>
                        </div>
                    </div>
                    
                    <div class="scheme-actions">
                        <button class="btn-primary apply-btn" data-scheme="${scheme.id}">
                            ${scheme.type === 'appliances' ? 'Order Now' : 'Apply Now'}
                        </button>
                        <button class="btn-secondary details-btn" data-scheme="${scheme.id}">
                            Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getSchemeIcon(type) {
        const icons = {
            solar: '☀️',
            appliances: '💡',
            ev: '🔌',
            state: '🏠',
            heating: '🔥',
            cooling: '❄️'
        };
        return icons[type] || '🏛️';
    }

    getBenefitSummary(scheme) {
        if (scheme.type === 'appliances') {
            return `${scheme.amount} per item`;
        } else if (scheme.type === 'solar') {
            return `Up to ₹${scheme.amount.toLocaleString()}`;
        }
        return `₹${scheme.amount.toLocaleString()} subsidy`;
    }

    getEligibilitySummary(scheme) {
        if (scheme.id === 'pm-surya-ghar') {
            return 'Income < ₹1.5L/year';
        } else if (scheme.id === 'ujala') {
            return 'All households';
        } else if (scheme.id === 'solar-pump') {
            return 'Farmers only';
        }
        return 'Check calculator';
    }

    renderApplicationTracker() {
        if (this.applications.length === 0) return;

        const application = this.applications[0];
        
        // Update timeline
        const timeline = document.querySelector('.timeline');
        if (timeline) {
            timeline.innerHTML = application.steps.map((step, index) => `
                <div class="timeline-item ${step.status}">
                    <div class="timeline-marker">
                        <span>${this.getStepIcon(step.status)}</span>
                    </div>
                    <div class="timeline-content">
                        <h4>${step.name}</h4>
                        <p>${step.date ? new Date(step.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        }) : 'TBD'}</p>
                        <span class="status-badge ${step.status}">${step.status}</span>
                    </div>
                </div>
            `).join('');
        }

        // Update document checklist
        const checklist = document.querySelector('.checklist');
        if (checklist && application.documents) {
            checklist.innerHTML = application.documents.map(doc => `
                <li class="${doc.status}">
                    <span class="check-icon">${this.getCheckIcon(doc.status)}</span>
                    ${doc.name}
                </li>
            `).join('');
        }

        // Update application summary
        const scheme = this.schemes.find(s => s.id === application.schemeId);
        if (scheme) {
            const summaryGrid = document.querySelector('.summary-grid');
            if (summaryGrid) {
                summaryGrid.innerHTML = `
                    <div class="summary-item">
                        <span class="summary-label">Scheme Applied:</span>
                        <span class="summary-value">${scheme.name}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Subsidy Amount:</span>
                        <span class="summary-value">₹${scheme.amount.toLocaleString()}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Status:</span>
                        <span class="summary-value status-${application.status}">${application.status}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Estimated Time:</span>
                        <span class="summary-value">30-45 days</span>
                    </div>
                `;
            }
        }
    }

    getStepIcon(status) {
        const icons = {
            completed: '✅',
            pending: '⏳',
            upcoming: '⭕',
            approved: '✅',
            rejected: '❌'
        };
        return icons[status] || '⭕';
    }

    getCheckIcon(status) {
        const icons = {
            completed: '✅',
            pending: '⏳',
            upcoming: '⭕'
        };
        return icons[status] || '⭕';
    }

    setupEventListeners() {
        // Apply buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('apply-btn')) {
                const schemeId = e.target.dataset.scheme;
                this.startApplication(schemeId);
            }

            if (e.target.classList.contains('details-btn')) {
                const schemeId = e.target.dataset.scheme;
                this.showSchemeDetails(schemeId);
            }

            if (e.target.classList.contains('prev-step')) {
                this.navigateWizard('prev');
            }

            if (e.target.closest('.next-step')) {
                e.preventDefault();
                this.navigateWizard('next');
            }

            if (e.target.id === 'trackApplication') {
                this.trackApplication();
            }

            if (e.target.id === 'downloadReceipt') {
                this.downloadReceipt();
            }
        });

        // Eligibility calculator form
        const calculatorForm = document.getElementById('eligibilityCalculator');
        if (calculatorForm) {
            calculatorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateEligibility();
            });
        }

        // Range sliders
        const incomeSlider = document.getElementById('incomeSlider');
        const incomeInput = document.getElementById('monthlyIncome');
        const billSlider = document.getElementById('billSlider');
        const billInput = document.getElementById('electricityBill');

        if (incomeSlider && incomeInput) {
            incomeSlider.addEventListener('input', (e) => {
                incomeInput.value = e.target.value;
            });

            incomeInput.addEventListener('input', (e) => {
                incomeSlider.value = e.target.value;
            });
        }

        if (billSlider && billInput) {
            billSlider.addEventListener('input', (e) => {
                billInput.value = e.target.value;
            });

            billInput.addEventListener('input', (e) => {
                billSlider.value = e.target.value;
            });
        }
    }

    setupSchemeFilters() {
        const filterButtons = document.querySelectorAll('.scheme-filters .filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Filter schemes
                this.filterSchemes(filter);
            });
        });
    }

    filterSchemes(filter) {
        const schemeCards = document.querySelectorAll('.scheme-card');
        
        schemeCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
            } else {
                const schemeType = card.dataset.scheme;
                const govtType = card.dataset.govt;
                
                if (filter === 'central' && govtType === 'central') {
                    card.style.display = 'block';
                } else if (filter === 'state' && govtType === 'state') {
                    card.style.display = 'block';
                } else if (filter === schemeType) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }

    initializeCalculator() {
        // Set initial values for sliders
        const incomeSlider = document.getElementById('incomeSlider');
        const incomeInput = document.getElementById('monthlyIncome');
        const billSlider = document.getElementById('billSlider');
        const billInput = document.getElementById('electricityBill');

        if (incomeSlider && incomeInput) {
            incomeInput.value = incomeSlider.value;
        }

        if (billSlider && billInput) {
            billInput.value = billSlider.value;
        }
    }

    calculateEligibility() {
        // Get form values
        const monthlyIncome = parseInt(document.getElementById('monthlyIncome').value);
        const annualIncome = monthlyIncome * 12;
        const electricityBill = parseInt(document.getElementById('electricityBill').value);
        const ownership = document.querySelector('input[name="ownership"]:checked').value;
        const hasRooftop = document.getElementById('hasRooftop').checked;
        const hasShadow = document.getElementById('hasShadow').checked;

        // Calculate eligibility for each scheme
        const results = {
            'pm-surya-ghar': this.checkPMSuryaGharEligibility(annualIncome, ownership, hasRooftop, hasShadow),
            'ujala': this.checkUJALAEligibility(annualIncome),
            'solar-pump': this.checkSolarPumpEligibility(ownership)
        };

        // Show results
        this.displayEligibilityResults(results);
    }

    checkPMSuryaGharEligibility(annualIncome, ownership, hasRooftop, hasShadow) {
        const eligible = annualIncome <= 150000 && 
                        ['owned', 'joint'].includes(ownership) && 
                        hasRooftop && 
                        !hasShadow;
        
        return {
            eligible,
            amount: 78000,
            reason: eligible ? '' : annualIncome > 150000 ? 'Income above ₹1.5L/year' : 'Rooftop requirement not met'
        };
    }

    checkUJALAEligibility(annualIncome) {
        const eligible = true; // UJALA is for all
        return {
            eligible,
            amount: 70,
            reason: ''
        };
    }

    checkSolarPumpEligibility(ownership) {
        const eligible = false; // Requires farmland
        return {
            eligible,
            amount: 300000,
            reason: 'Requires agricultural land'
        };
    }

    displayEligibilityResults(results) {
        const resultsContainer = document.getElementById('calculatorResults');
        const resultsGrid = resultsContainer.querySelector('.results-grid');

        if (!resultsGrid) return;

        const resultsHTML = Object.entries(results).map(([schemeId, result]) => {
            const scheme = this.schemes.find(s => s.id === schemeId);
            if (!scheme) return '';

            return `
                <div class="result-item">
                    <span class="result-label">${scheme.name}</span>
                    <span class="result-value ${result.eligible ? 'eligible' : 'not-eligible'}">
                        ${result.eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                    <span class="result-amount">
                        ${result.eligible ? `Up to ₹${result.amount.toLocaleString()}` : result.reason}
                    </span>
                </div>
            `;
        }).join('');

        resultsGrid.innerHTML = resultsHTML;
        resultsContainer.style.display = 'block';

        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Update eligibility badge
        const eligibleCount = Object.values(results).filter(r => r.eligible).length;
        this.updateEligibilityBadge(eligibleCount);
    }

    updateEligibilityBadge(count) {
        const badge = document.querySelector('.eligibility-badge');
        if (badge) {
            badge.innerHTML = `
                <span class="badge-icon">✅</span>
                <span>You're eligible for ${count} scheme${count !== 1 ? 's' : ''}</span>
            `;
        }
    }

    startApplication(schemeId) {
        const scheme = this.schemes.find(s => s.id === schemeId);
        if (!scheme) return;

        // Check eligibility first
        const results = this.calculateQuickEligibility(schemeId);
        
        if (!results.eligible) {
            this.showNotification(`You're not eligible for ${scheme.name}. ${results.reason}`, 'error');
            return;
        }

        // Show application wizard
        this.showApplicationWizard(scheme);
    }

    calculateQuickEligibility(schemeId) {
        // Simplified eligibility check for demo
        if (schemeId === 'pm-surya-ghar') {
            const monthlyIncome = parseInt(document.getElementById('monthlyIncome')?.value || 75000);
            return {
                eligible: monthlyIncome * 12 <= 150000,
                reason: 'Income must be below ₹1.5L/year'
            };
        }
        
        return { eligible: true, reason: '' };
    }

    showApplicationWizard(scheme) {
        // Update wizard with scheme details
        const wizardCard = document.querySelector('.wizard-card');
        if (!wizardCard) return;

        // Update progress to step 1
        this.resetWizardProgress();
        
        // Show wizard if hidden
        wizardCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update application summary
        const summaryGrid = document.querySelector('.summary-grid');
        if (summaryGrid) {
            summaryGrid.innerHTML = `
                <div class="summary-item">
                    <span class="summary-label">Scheme:</span>
                    <span class="summary-value">${scheme.name}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Subsidy:</span>
                    <span class="summary-value">₹${scheme.amount.toLocaleString()}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Status:</span>
                    <span class="summary-value status-pending">Ready to Apply</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Time:</span>
                    <span class="summary-value">~30 minutes</span>
                </div>
            `;
        }

        // Show notification
        this.showNotification(`Starting application for ${scheme.name}`, 'info');
    }

    resetWizardProgress() {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            step.classList.remove('completed', 'current');
            if (index === 0) {
                step.classList.add('current');
            }
        });
    }

    navigateWizard(direction) {
        const steps = document.querySelectorAll('.progress-step');
        const currentIndex = Array.from(steps).findIndex(step => step.classList.contains('current'));
        
        if (direction === 'next' && currentIndex < steps.length - 1) {
            steps[currentIndex].classList.remove('current');
            steps[currentIndex].classList.add('completed');
            steps[currentIndex + 1].classList.add('current');
            
            // Update wizard step content
            this.updateWizardStep(currentIndex + 1);
            
            // If this is the last step, submit application
            if (currentIndex + 1 === steps.length - 1) {
                this.submitApplication();
            }
        } else if (direction === 'prev' && currentIndex > 0) {
            steps[currentIndex].classList.remove('current');
            steps[currentIndex - 1].classList.remove('completed');
            steps[currentIndex - 1].classList.add('current');
            
            this.updateWizardStep(currentIndex - 1);
        }
    }

    updateWizardStep(stepIndex) {
        const wizardForm = document.getElementById('applicationWizard');
        if (!wizardForm) return;

        const steps = [
            {
                title: 'Personal Details',
                content: `
                    <h3>Personal Information</h3>
                    <p>Enter your personal details for the application</p>
                    <!-- Personal details form would go here -->
                `
            },
            {
                title: 'Document Upload',
                content: `
                    <h3>Document Submission</h3>
                    <p>Upload required documents for verification</p>
                    <!-- Document upload form would go here -->
                `
            },
            {
                title: 'Bank Details',
                content: wizardForm.querySelector('#step3')?.innerHTML || ''
            },
            {
                title: 'Review & Submit',
                content: `
                    <h3>Review Application</h3>
                    <p>Review all details before submission</p>
                    <!-- Review content would go here -->
                `
            }
        ];

        if (stepIndex >= 0 && stepIndex < steps.length) {
            wizardForm.innerHTML = steps[stepIndex].content;
        }
    }

    submitApplication() {
        // Create new application
        const newApplication = {
            id: `URJASAATHI-${Date.now()}`,
            schemeId: 'pm-surya-ghar', // Default for demo
            status: 'submitted',
            submitted: new Date().toISOString().split('T')[0],
            steps: [
                { name: 'Application', status: 'completed', date: new Date().toISOString().split('T')[0] },
                { name: 'Document Verification', status: 'pending', date: null },
                { name: 'Technical Inspection', status: 'upcoming', date: null },
                { name: 'Subsidy Disbursement', status: 'upcoming', date: null }
            ],
            documents: [
                { name: 'Aadhaar Card', status: 'pending' },
                { name: 'PAN Card', status: 'pending' },
                { name: 'Electricity Bill', status: 'pending' },
                { name: 'Bank Passbook', status: 'pending' },
                { name: 'Property Papers', status: 'pending' }
            ]
        };

        // Add to applications
        this.applications.unshift(newApplication);
        this.saveApplications();

        // Show success modal
        this.showSuccessModal(newApplication.id);

        // Reset wizard
        this.resetWizardProgress();
        this.updateWizardStep(0);
    }

    showSuccessModal(applicationId) {
        const modal = document.getElementById('successModal');
        if (!modal) return;

        // Update application ID
        const appIdElement = modal.querySelector('p strong');
        if (appIdElement) {
            appIdElement.nextSibling.textContent = ` ${applicationId}`;
        }

        // Show modal
        modal.classList.add('active');
        modal.removeAttribute('hidden');
        modal.setAttribute('aria-hidden', 'false');

        // Setup close handlers
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal(modal));
        }

        // Update tracker
        this.renderApplicationTracker();
    }

    showSchemeDetails(schemeId) {
        const scheme = this.schemes.find(s => s.id === schemeId);
        if (!scheme) return;

        const modal = document.getElementById('schemeModal');
        if (!modal) return;

        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = this.createSchemeDetailsHTML(scheme);
        }

        // Update modal title
        const modalTitle = modal.querySelector('#schemeModalTitle');
        if (modalTitle) {
            modalTitle.textContent = scheme.name;
        }

        // Show modal
        modal.classList.add('active');
        modal.removeAttribute('hidden');
        modal.setAttribute('aria-hidden', 'false');

        // Setup close handler
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal(modal));
        }
    }

    createSchemeDetailsHTML(scheme) {
        return `
            <div class="scheme-details-modal">
                <div class="scheme-header">
                    <div class="scheme-icon-large">${this.getSchemeIcon(scheme.type)}</div>
                    <div>
                        <h3>${scheme.name}</h3>
                        <p class="scheme-amount-large">₹${scheme.amount.toLocaleString()} Subsidy</p>
                    </div>
                </div>
                
                <div class="scheme-description-full">
                    <p>${scheme.description}</p>
                </div>
                
                <div class="details-grid">
                    <div class="detail-section">
                        <h4>📋 Eligibility Criteria</h4>
                        <ul>
                            ${scheme.eligibility.incomeMax ? `<li>Annual income ≤ ₹${scheme.eligibility.incomeMax.toLocaleString()}</li>` : ''}
                            ${scheme.eligibility.hasRooftop ? '<li>Must have accessible rooftop</li>' : ''}
                            ${scheme.eligibility.ownership ? `<li>Home ownership: ${scheme.eligibility.ownership.join(', ')}</li>` : ''}
                            ${scheme.eligibility.isFarmer ? '<li>Must be a registered farmer</li>' : ''}
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h4>💰 Benefits</h4>
                        <ul>
                            ${scheme.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h4>⏰ Important Dates</h4>
                        <ul>
                            <li>Application Deadline: ${scheme.deadline ? new Date(scheme.deadline).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            }) : 'Ongoing'}</li>
                            <li>Processing Time: 30-45 days</li>
                            <li>Subsidy Disbursement: Within 60 days of approval</li>
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h4>📞 Contact Information</h4>
                        <ul>
                            <li>Helpline: 1800-123-4567</li>
                            <li>Email: subsidies@urjasaathi.com</li>
                            <li>Website: mnre.gov.in</li>
                            <li>Office Hours: 9 AM - 6 PM (Mon-Sat)</li>
                        </ul>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn-primary apply-btn" data-scheme="${scheme.id}">
                        ${scheme.type === 'appliances' ? 'Order Now' : 'Apply Now'}
                    </button>
                    <button class="btn-secondary" onclick="window.print()">
                        Print Details
                    </button>
                </div>
            </div>
        `;
    }

    trackApplication() {
        // Navigate to tracker section
        const tracker = document.querySelector('.tracker-card');
        if (tracker) {
            tracker.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        this.hideModal(document.getElementById('successModal'));
    }

    downloadReceipt() {
        const application = this.applications[0];
        if (!application) return;

        // Create receipt content
        const receipt = `
            UrjaSaathi - Subsidy Application Receipt
            ======================================
            
            Application ID: ${application.id}
            Date: ${new Date().toLocaleDateString('en-IN')}
            Time: ${new Date().toLocaleTimeString('en-IN')}
            
            Scheme: PM Surya Ghar Yojana
            Subsidy Amount: ₹78,000
            
            Applicant: Amit Sharma
            Contact: +91 98765 43210
            
            Status: Application Submitted
            Next Step: Document Verification
            
            --------------------------------------
            Important Notes:
            1. Keep this receipt for future reference
            2. Application will be processed in 30-45 days
            3. Check status at urjasaathi.com/track
            
            Need Help? Contact: 1800-123-4567
            
            ======================================
            Thank you for choosing UrjaSaathi!
        `;

        // Create download
        const blob = new Blob([receipt], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `UrjaSaathi-Receipt-${application.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showNotification('Receipt downloaded successfully', 'success');
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

    saveApplications() {
        localStorage.setItem('urjasaathi_applications', JSON.stringify(this.applications));
    }

    showNotification(message, type = 'info') {
        if (window.UrjaSaathi && window.UrjaSaathi.showNotification) {
            window.UrjaSaathi.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize subsidy manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.SubsidyManager = new SubsidyManager();
});