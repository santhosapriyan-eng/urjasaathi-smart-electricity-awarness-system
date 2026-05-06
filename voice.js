// UrjaSaathi - Voice Module
// Handles advanced voice features and speech synthesis

class VoiceManager {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.isSpeaking = false;
        this.voices = [];
        this.selectedVoice = null;
        this.init();
    }

    async init() {
        await this.loadVoices();
        this.setupEventListeners();
        this.setupVoiceCommands();
    }

    loadVoices() {
        return new Promise((resolve) => {
            // Chrome loads voices asynchronously
            if (this.speechSynthesis.getVoices().length > 0) {
                this.voices = this.speechSynthesis.getVoices();
                this.selectVoice();
                resolve();
            } else {
                this.speechSynthesis.onvoiceschanged = () => {
                    this.voices = this.speechSynthesis.getVoices();
                    this.selectVoice();
                    resolve();
                };
            }
        });
    }

    selectVoice() {
        // Prefer Indian English voice if available
        const indianVoice = this.voices.find(voice => 
            voice.lang === 'en-IN' || voice.name.includes('India')
        );
        
        if (indianVoice) {
            this.selectedVoice = indianVoice;
        } else {
            // Fallback to any English voice
            const englishVoice = this.voices.find(voice => 
                voice.lang.startsWith('en')
            );
            this.selectedVoice = englishVoice || this.voices[0];
        }
    }

    setupEventListeners() {
        // Language selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('lang-badge')) {
                const language = e.target.textContent;
                this.setLanguage(language);
            }
        });

        // Stop speaking on page change
        window.addEventListener('beforeunload', () => {
            this.stopSpeaking();
        });
    }

    setupVoiceCommands() {
        // Voice command patterns
        this.commands = {
            // Basic commands
            'hello': () => this.handleCommand('hello'),
            'help': () => this.handleCommand('help'),
            'stop': () => this.stopSpeaking(),
            
            // Navigation commands
            'go to dashboard': () => window.location.href = 'index.html',
            'open appliances': () => window.location.href = 'appliances.html',
            'show subsidies': () => window.location.href = 'subsidies.html',
            'open solar': () => window.location.href = 'solar.html',
            'show community': () => window.location.href = 'community.html',
            
            // Energy commands
            'current usage': () => this.speakEnergyUsage(),
            'today\'s cost': () => this.speakTodaysCost(),
            'monthly savings': () => this.speakMonthlySavings(),
            'solar generation': () => this.speakSolarGeneration(),
            
            // Appliance commands
            'turn on all appliances': () => this.controlAppliances('all', 'on'),
            'turn off all appliances': () => this.controlAppliances('all', 'off'),
            'turn on air conditioner': () => this.controlAppliance('Air Conditioner', 'on'),
            'turn off air conditioner': () => this.controlAppliance('Air Conditioner', 'off'),
            'turn on lights': () => this.controlAppliance('LED Lights', 'on'),
            'turn off lights': () => this.controlAppliance('LED Lights', 'off'),
            
            // Emergency commands
            'energy emergency': () => this.handleEmergency(),
            'power outage': () => this.handlePowerOutage(),
            'high bill': () => this.handleHighBill(),
            
            // Information commands
            'energy tips': () => this.speakEnergyTips(),
            'subsidy information': () => this.speakSubsidyInfo(),
            'solar information': () => this.speakSolarInfo()
        };
    }

    setLanguage(language) {
        // Update UI
        document.querySelectorAll('.lang-badge').forEach(badge => {
            badge.classList.remove('active');
        });
        
        const activeBadge = Array.from(document.querySelectorAll('.lang-badge'))
            .find(badge => badge.textContent === language);
        
        if (activeBadge) {
            activeBadge.classList.add('active');
        }

        // For now, we only support English in this demo
        // In a real app, we would switch speech recognition language
        this.speak(`Switched to ${language}. Note: Full language support coming soon.`);
    }

    speak(text, rate = 1, pitch = 1) {
        if (!this.speechSynthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }

        this.stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(text);
        
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1;
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateSpeakingStatus(true);
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateSpeakingStatus(false);
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            this.updateSpeakingStatus(false);
        };

        this.speechSynthesis.speak(utterance);
    }

    stopSpeaking() {
        if (this.speechSynthesis && this.isSpeaking) {
            this.speechSynthesis.cancel();
            this.isSpeaking = false;
            this.updateSpeakingStatus(false);
        }
    }

    updateSpeakingStatus(isSpeaking) {
        // Could update UI to show speaking status
        if (isSpeaking) {
            console.log('AI Assistant is speaking...');
        }
    }

    handleCommand(command) {
        const handler = this.commands[command.toLowerCase()];
        if (handler) {
            handler();
        } else {
            this.speak(`I don't understand the command: ${command}. Try saying "help" for available commands.`);
        }
    }

    // Command Handlers
    handleCommand(type) {
        switch(type) {
            case 'hello':
                this.speak('Hello! I am your UrjaSaathi voice assistant. How can I help you with energy management today?');
                break;
            case 'help':
                this.speak('Here are some things you can ask me: Check current usage, turn appliances on or off, get energy tips, apply for subsidies, or handle emergencies.');
                break;
        }
    }

    speakEnergyUsage() {
        const usage = "Your current energy usage is 1.4 kilowatts. This is 12 percent higher than yesterday. Your top consuming appliance is the air conditioner at 800 watts.";
        this.speak(usage);
    }

    speakTodaysCost() {
        const cost = "Today's electricity cost is 142 rupees. This is 8 percent lower than your average daily cost. Great job on saving!";
        this.speak(cost);
    }

    speakMonthlySavings() {
        const savings = "Your monthly savings are 1,250 rupees. With AI optimizations, you can save an additional 425 rupees per month.";
        this.speak(savings);
    }

    speakSolarGeneration() {
        const solar = "Your solar panels are generating 2.8 kilowatt hours today. This is 15 percent higher than optimal. Excellent performance!";
        this.speak(solar);
    }

    controlAppliances(type, action) {
        if (type === 'all') {
            const message = action === 'on' 
                ? 'Turning on all appliances. This may increase your energy consumption significantly.'
                : 'Turning off all appliances. This will help save energy.';
            this.speak(message);
            
            // In a real app, this would trigger appliance control
            this.showNotification(`All appliances turned ${action}`, 'info');
        }
    }

    controlAppliance(appliance, action) {
        const message = `${action === 'on' ? 'Turning on' : 'Turning off'} ${appliance.toLowerCase()}.`;
        this.speak(message);
        
        // In a real app, this would trigger specific appliance control
        this.showNotification(`${appliance} turned ${action}`, 'info');
    }

    handleEmergency() {
        this.speak("Opening emergency options. Please select the type of emergency from the screen, or tell me: power outage, high bill, appliance fault, or safety issue.");
        
        // Show emergency modal
        const emergencyBtn = document.getElementById('emergencyBtn');
        if (emergencyBtn) {
            emergencyBtn.click();
        }
    }

    handlePowerOutage() {
        this.speak("For power outages: First, check with your neighbors. Then, report to your electricity provider at 1912. Estimated restoration is usually 2 to 4 hours. Would you like me to report this outage for you?");
    }

    handleHighBill() {
        this.speak("For unexpected high bills: Check your meter reading, analyze appliance usage patterns, and contact your electricity provider for clarification. I can help you analyze your usage. Would you like me to show your consumption patterns?");
    }

    speakEnergyTips() {
        const tips = [
            "Set your air conditioner to 24 degrees instead of 18 to save 300 rupees per month.",
            "Turn off appliances at the plug point to save 150 rupees per month.",
            "Replace old bulbs with LED lights to save 180 rupees per month.",
            "Use your washing machine only with full loads to save 100 rupees per month."
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        this.speak(randomTip);
    }

    speakSubsidyInfo() {
        const info = "You are eligible for the P M Surya Ghar Yojana with a subsidy of 78,000 rupees, and the U J A L A LED scheme with bulbs at 70 rupees each. Would you like to apply for any of these schemes?";
        this.speak(info);
    }

    speakSolarInfo() {
        const info = "For your home, I recommend a 3 kilowatt solar system. Total cost is 1,80,000 rupees with a subsidy of 78,000 rupees. Monthly savings would be 2,500 rupees with a payback period of 3.5 years. Would you like a detailed analysis?";
        this.speak(info);
    }

    // Process voice input from AI Assistant
    processVoiceCommand(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        // Check for exact matches first
        for (const command in this.commands) {
            if (lowerTranscript.includes(command)) {
                this.handleCommand(command);
                return true;
            }
        }

        // Check for partial matches
        if (lowerTranscript.includes('usage') || lowerTranscript.includes('consumption')) {
            this.speakEnergyUsage();
            return true;
        }
        
        if (lowerTranscript.includes('cost') || lowerTranscript.includes('bill')) {
            this.speakTodaysCost();
            return true;
        }
        
        if (lowerTranscript.includes('save') || lowerTranscript.includes('saving')) {
            this.speakMonthlySavings();
            return true;
        }
        
        if (lowerTranscript.includes('solar')) {
            this.speakSolarGeneration();
            return true;
        }
        
        if (lowerTranscript.includes('tip') || lowerTranscript.includes('advice')) {
            this.speakEnergyTips();
            return true;
        }
        
        if (lowerTranscript.includes('subsidy') || lowerTranscript.includes('government')) {
            this.speakSubsidyInfo();
            return true;
        }

        // If no match, let AI Assistant handle it as a chat message
        return false;
    }

    showNotification(message, type = 'info') {
        if (window.UrjaSaathi && window.UrjaSaathi.showNotification) {
            window.UrjaSaathi.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize Voice Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.VoiceManager = new VoiceManager();
    
    // Integrate with AI Assistant
    if (window.AIAssistant) {
        // Override voice input handler to use voice commands
        const originalHandleVoiceInput = window.AIAssistant.handleVoiceInput;
        
        window.AIAssistant.handleVoiceInput = function(transcript) {
            // First try to process as a voice command
            if (window.VoiceManager.processVoiceCommand(transcript)) {
                return;
            }
            
            // If not a voice command, proceed as chat message
            originalHandleVoiceInput.call(this, transcript);
        };
    }
});