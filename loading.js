// UrjaSaathi - Loading System
// Manages the epic loading screen experience

class LoadingSystem {
    constructor() {
        this.progress = 0;
        this.messages = [
            "Initializing smart grid system...",
            "Connecting to IoT devices...",
            "Loading energy analytics...",
            "Starting AI assistant...",
            "Fetching subsidy data...",
            "Preparing solar recommendations...",
            "Finalizing dashboard..."
        ];
        this.currentMessageIndex = 0;
        this.isLoading = true;
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.startLoadingSequence();
        this.setupProgressSimulation();
        this.createParticles();
    }

    cacheElements() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.progressBar = document.getElementById('progressBar');
        this.loadingMessage = document.getElementById('loadingMessage');
    }

    startLoadingSequence() {
        // Initial delay for visual impact
        setTimeout(() => {
            this.animateLogo();
            this.startMessageRotation();
            this.simulateProgress();
        }, 500);
    }

    animateLogo() {
        const logo = document.querySelector('.loading-logo');
        if (logo) {
            logo.style.animation = 'logoFloat 3s ease-in-out infinite';
        }
    }

    startMessageRotation() {
        // Show first message
        this.updateMessage();
        
        // Rotate messages every 1.5 seconds
        this.messageInterval = setInterval(() => {
            this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
            this.updateMessage();
        }, 1500);
    }

    updateMessage() {
        if (this.loadingMessage) {
            // Fade out
            this.loadingMessage.style.opacity = '0';
            this.loadingMessage.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                // Update text
                this.loadingMessage.textContent = this.messages[this.currentMessageIndex];
                
                // Fade in
                this.loadingMessage.style.opacity = '1';
                this.loadingMessage.style.transform = 'translateY(0)';
            }, 300);
        }
    }

    simulateProgress() {
        const totalSteps = 100;
        const duration = 5000; // 5 seconds total
        const stepDuration = duration / totalSteps;
        
        let step = 0;
        
        this.progressInterval = setInterval(() => {
            step++;
            
            // Simulate realistic loading with variable speed
            let increment;
            if (step < 30) {
                increment = 1; // Fast initial load
            } else if (step < 70) {
                increment = 0.7; // Slower middle section
            } else {
                increment = 0.3; // Slow final completion
            }
            
            this.progress = Math.min(this.progress + increment, 100);
            this.updateProgressBar();
            
            // Add feature badges at specific progress points
            this.showFeatureBadges();
            
            if (this.progress >= 100) {
                this.completeLoading();
            }
        }, stepDuration);
    }

    setupProgressSimulation() {
        // Simulate network requests
        setTimeout(() => this.simulateNetworkRequest('appliances'), 800);
        setTimeout(() => this.simulateNetworkRequest('user-data'), 1200);
        setTimeout(() => this.simulateNetworkRequest('tariffs'), 1800);
        setTimeout(() => this.simulateNetworkRequest('charts'), 2500);
        setTimeout(() => this.simulateNetworkRequest('ai-model'), 3200);
    }

    simulateNetworkRequest(type) {
        // Simulate random delay for network request
        const delay = Math.random() * 500 + 200;
        
        setTimeout(() => {
            // Random chance of failure for realism
            const success = Math.random() > 0.1;
            
            if (success) {
                console.log(`✅ ${type} loaded successfully`);
                // Small progress boost
                this.progress = Math.min(this.progress + 2, 100);
                this.updateProgressBar();
            } else {
                console.log(`⚠️ ${type} load delayed, retrying...`);
                // Retry after delay
                setTimeout(() => {
                    this.progress = Math.min(this.progress + 1, 100);
                    this.updateProgressBar();
                }, 300);
            }
        }, delay);
    }

    updateProgressBar() {
        if (this.progressBar) {
            this.progressBar.style.width = `${this.progress}%`;
            
            // Update percentage display if exists
            const percentageDisplay = document.querySelector('.loading-percentage');
            if (percentageDisplay) {
                percentageDisplay.textContent = `${Math.floor(this.progress)}%`;
            }
        }
    }

    showFeatureBadges() {
        // Show badges at specific progress milestones
        const milestones = [25, 50, 75, 90];
        
        milestones.forEach((milestone, index) => {
            if (this.progress >= milestone && this.progress < milestone + 1) {
                this.createFeatureBadge(index);
            }
        });
    }

    createFeatureBadge(index) {
        const features = [
            { icon: '⚡', text: 'Real-time Monitoring' },
            { icon: '🤖', text: 'AI Energy Assistant' },
            { icon: '🏛️', text: 'Govt Subsidies' },
            { icon: '☀️', text: 'Solar Calculator' }
        ];
        
        // Create badge container if not exists
        let badgeContainer = document.querySelector('.loading-features');
        if (!badgeContainer) {
            badgeContainer = document.createElement('div');
            badgeContainer.className = 'loading-features';
            this.loadingScreen.appendChild(badgeContainer);
        }
        
        // Check if badge already exists
        const existingBadge = badgeContainer.querySelector(`[data-feature="${index}"]`);
        if (existingBadge) return;
        
        // Create new badge
        const badge = document.createElement('div');
        badge.className = 'feature-badge';
        badge.dataset.feature = index;
        badge.innerHTML = `
            <span>${features[index].icon}</span>
            <span>${features[index].text}</span>
        `;
        
        // Add entrance animation
        badge.style.opacity = '0';
        badge.style.transform = 'translateY(20px)';
        
        badgeContainer.appendChild(badge);
        
        // Animate in
        setTimeout(() => {
            badge.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            badge.style.opacity = '1';
            badge.style.transform = 'translateY(0)';
        }, 10);
    }

    createParticles() {
        const particleCount = 30;
        const container = document.createElement('div');
        container.className = 'particles';
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties
            const size = Math.random() * 3 + 1;
            const posX = Math.random() * 100;
            const delay = Math.random() * 10;
            const duration = 10 + Math.random() * 20;
            const tx = Math.random() * 200 - 100;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${posX}vw;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                --tx: ${tx}px;
            `;
            
            container.appendChild(particle);
        }
        
        this.loadingScreen.appendChild(container);
    }

    completeLoading() {
        // Clear intervals
        clearInterval(this.progressInterval);
        clearInterval(this.messageInterval);
        
        // Update to 100% for safety
        this.progress = 100;
        this.updateProgressBar();
        
        // Show completion message
        this.loadingMessage.textContent = "Ready! Starting UrjaSaathi...";
        this.loadingMessage.style.color = '#10b981';
        
        // Trigger completion animation
        setTimeout(() => {
            this.triggerCompletionAnimation();
        }, 800);
    }

    triggerCompletionAnimation() {
        // Add completion class for final animation
        this.loadingScreen.classList.add('loading-complete');
        
        // Hide loading screen after animation
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 600);
    }

    hideLoadingScreen() {
        // Fade out
        this.loadingScreen.classList.add('fade-out');
        
        // Remove from DOM after animation
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
            
            // Dispatch event for other components
            document.dispatchEvent(new CustomEvent('loadingComplete'));
            
            // Enable app interactions
            this.isLoading = false;
        }, 800);
    }

    // Public method to manually complete loading (for debugging)
    forceComplete() {
        this.progress = 100;
        this.completeLoading();
    }

    // Public method to reset loading (for development)
    reset() {
        this.progress = 0;
        this.currentMessageIndex = 0;
        this.isLoading = true;
        
        clearInterval(this.progressInterval);
        clearInterval(this.messageInterval);
        
        this.updateProgressBar();
        this.updateMessage();
        
        this.loadingScreen.style.display = 'flex';
        this.loadingScreen.classList.remove('fade-out', 'loading-complete');
        
        this.startLoadingSequence();
    }
}

// Initialize loading system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.LoadingSystem = new LoadingSystem();
    
    // Development shortcut: double-click logo to skip loading
    document.addEventListener('dblclick', (e) => {
        if (e.target.closest('.loading-logo')) {
            window.LoadingSystem.forceComplete();
        }
    });
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingSystem;
}