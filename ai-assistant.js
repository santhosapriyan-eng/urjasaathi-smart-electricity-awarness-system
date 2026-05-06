// UrjaSaathi - AI Assistant Module
// Handles AI chat functionality and responses

class AIAssistant {
    constructor() {
        this.conversation = [];
        this.isListening = false;
        this.speechRecognition = null;
        this.init();
    }

    init() {
        this.loadConversation();
        this.setupEventListeners();
        this.setupQuickActions();
        this.showWelcomeMessage();
        this.initializeVoiceRecognition();
    }

    loadConversation() {
        const savedConversation = localStorage.getItem('urjasaathi_ai_conversation');
        
        if (savedConversation) {
            this.conversation = JSON.parse(savedConversation);
            this.renderConversation();
        } else {
            // Default conversation
            this.conversation = [
                {
                    id: 1,
                    type: 'bot',
                    message: 'Hello! I\'m your UrjaSaathi AI Assistant. How can I help you with energy savings today?',
                    time: new Date().toISOString(),
                    suggestions: ['current usage', 'savings tips', 'subsidy check', 'solar advice']
                }
            ];
            this.saveConversation();
        }
    }

    saveConversation() {
        // Keep only last 50 messages
        if (this.conversation.length > 50) {
            this.conversation = this.conversation.slice(-50);
        }
        
        localStorage.setItem('urjasaathi_ai_conversation', JSON.stringify(this.conversation));
    }

    renderConversation() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        chatMessages.innerHTML = this.conversation.map(msg => this.createMessageHTML(msg)).join('');
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    createMessageHTML(message) {
        const time = new Date(message.time).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const messageClass = message.type === 'bot' ? 'bot' : 'user';
        const avatar = message.type === 'bot' ? '🤖' : '👤';
        const avatarClass = message.type === 'bot' ? 'bot-avatar' : 'user-avatar';

        return `
            <div class="message ${messageClass}">
                <div class="message-avatar ${avatarClass}">
                    ${avatar}
                </div>
                <div class="message-content">
                    <p class="message-text">${this.formatMessage(message.message)}</p>
                    <span class="message-time">${time}</span>
                    
                    ${message.suggestions ? `
                        <div class="message-actions">
                            ${message.suggestions.map(suggestion => `
                                <button class="message-action-btn" data-suggestion="${suggestion}">
                                    ${suggestion}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatMessage(message) {
        // Convert markdown-like syntax to HTML
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    setupEventListeners() {
        // Send message on Enter
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Send button
        const sendBtn = document.getElementById('sendMessage');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Quick suggestions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const query = e.target.dataset.query;
                this.handleQuickSuggestion(query);
            }

            if (e.target.classList.contains('message-action-btn')) {
                const suggestion = e.target.dataset.suggestion;
                this.handleQuickSuggestion(suggestion);
            }

            if (e.target.classList.contains('action-btn')) {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            }

            if (e.target.id === 'quickTipsBtn') {
                this.showQuickTips();
            }

            if (e.target.id === 'emergencyBtn') {
                this.showEmergencyModal();
            }

            if (e.target.closest('.emergency-option')) {
                const emergencyType = e.target.closest('.emergency-option').dataset.emergency;
                this.handleEmergency(emergencyType);
            }
        });

        // Voice input button
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        }

        // Start listening button
        const startListeningBtn = document.getElementById('startListening');
        if (startListeningBtn) {
            startListeningBtn.addEventListener('click', () => this.toggleVoiceInput());
        }
    }

    setupQuickActions() {
        const quickActions = {
            'usage': 'What is my current energy usage?',
            'savings': 'How can I save money on electricity?',
            'subsidy': 'Check my subsidy eligibility',
            'solar': 'Should I install solar panels?',
            'appliance': 'Control my appliances',
            'emergency': 'I have an energy emergency'
        };

        Object.entries(quickActions).forEach(([action, query]) => {
            const btn = document.querySelector(`[data-action="${action}"]`);
            if (btn) {
                btn.addEventListener('click', () => this.handleQuickSuggestion(query));
            }
        });
    }

    showWelcomeMessage() {
        // Already shown in initial conversation
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage('user', message);

        // Clear input
        chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Process after delay
        setTimeout(() => {
            this.processUserMessage(message);
        }, 1000);
    }

    addMessage(type, message, suggestions = null) {
        const newMessage = {
            id: Date.now(),
            type: type,
            message: message,
            time: new Date().toISOString(),
            suggestions: suggestions
        };

        this.conversation.push(newMessage);
        this.renderConversation();
        this.saveConversation();
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const typingIndicator = `
            <div class="message bot" id="typingIndicator">
                <div class="message-avatar bot-avatar">
                    🤖
                </div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        chatMessages.insertAdjacentHTML('beforeend', typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    processUserMessage(message) {
        this.removeTypingIndicator();

        const lowerMessage = message.toLowerCase();

        // Pre-programmed responses
        let response = '';
        let suggestions = [];

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            response = 'Hello! How can I assist you with energy management today?';
            suggestions = ['current usage', 'savings tips', 'subsidy check'];
        } 
        else if (lowerMessage.includes('usage') || lowerMessage.includes('consumption')) {
            response = `Your current energy usage is **1.4 kW**. This is 12% higher than yesterday. \n\n**Top consumers:**\n• AC: 0.8 kW\n• Refrigerator: 0.15 kW\n• Lights: 0.1 kW\n\nWould you like me to suggest optimizations?`;
            suggestions = ['optimize usage', 'appliance control', 'view details'];
        }
        else if (lowerMessage.includes('save') || lowerMessage.includes('saving') || lowerMessage.includes('money')) {
            response = `Here are your top savings opportunities:\n\n1. **Turn off AC 30 mins earlier** - Save ₹45/day\n2. **Replace 2 old bulbs with LEDs** - Save ₹180/month\n3. **Use washing machine with full load** - Save ₹100/month\n4. **Install 3kW solar system** - Save ₹2,500/month\n\nWhich one would you like to implement?`;
            suggestions = ['implement #1', 'LED details', 'solar calculator'];
        }
        else if (lowerMessage.includes('subsidy') || lowerMessage.includes('government')) {
            response = `Based on your profile, you're eligible for:\n\n**🏛️ PM Surya Ghar Yojana**\n• Subsidy: ₹78,000\n• 300 free units/month\n• Eligibility: Income < ₹1.5L/year\n\n**💡 UJALA LED Scheme**\n• LED bulbs at ₹70 each\n• Save 80% on lighting\n• Limit: 4 bulbs per family\n\nWould you like to apply?`;
            suggestions = ['apply PM Surya Ghar', 'order LED bulbs', 'check eligibility'];
        }
        else if (lowerMessage.includes('solar') || lowerMessage.includes('panel')) {
            response = `**Solar Recommendation for your home:**\n\n• **System Size:** 3 kW\n• **Total Cost:** ₹1,80,000\n• **Subsidy:** ₹78,000\n• **Net Cost:** ₹1,02,000\n• **Monthly Savings:** ₹2,500\n• **Payback Period:** 3.5 years\n\nWould you like a detailed analysis?`;
            suggestions = ['detailed analysis', 'find installers', 'apply subsidy'];
        }
        else if (lowerMessage.includes('bill') || lowerMessage.includes('cost')) {
            const today = new Date();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const daysSoFar = today.getDate();
            const estimatedBill = Math.round(3500 * (daysInMonth / daysSoFar));
            
            response = `**Bill Analysis:**\n\n• **Current Month Usage:** 340 kWh\n• **Estimated Bill:** ₹${estimatedBill}\n• **Compared to Last Month:** ↓8% savings\n• **Peak Usage Hours:** 6 PM - 10 PM\n\n**Suggestions to reduce bill:**\n1. Shift heavy usage to off-peak hours\n2. Consider solar installation\n3. Check for faulty appliances`;
            suggestions = ['peak hour tips', 'solar details', 'appliance check'];
        }
        else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
            response = `🚨 **Energy Emergency Assistance**\n\nI can help you with:\n1. **Power Outage** - Report & restoration time\n2. **High Bill** - Analysis & dispute assistance\n3. **Appliance Fault** - Diagnosis & repair services\n4. **Safety Issue** - Immediate steps & contacts\n\nWhat type of emergency are you facing?`;
            suggestions = ['power outage', 'high bill', 'appliance fault', 'safety issue'];
        }
        else {
            response = `I understand you're asking about "${message}". As an AI energy assistant, I can help you with:\n\n• **Real-time energy monitoring**\n• **Cost-saving recommendations**\n• **Government subsidy applications**\n• **Solar installation analysis**\n• **Appliance control & scheduling**\n• **Emergency assistance**\n\nWhat would you like to know more about?`;
            suggestions = ['energy monitoring', 'savings tips', 'subsidy help', 'solar advice'];
        }

        // Add bot response
        this.addMessage('bot', response, suggestions);
    }

    handleQuickSuggestion(query) {
        // Set query in input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = query;
            chatInput.focus();
        }

        // Send immediately
        setTimeout(() => this.sendMessage(), 100);
    }

    handleQuickAction(action) {
        const actions = {
            'usage': 'What is my current energy usage and how can I optimize it?',
            'savings': 'Show me personalized savings recommendations',
            'subsidy': 'Check my eligibility for government subsidies',
            'solar': 'Should I install solar panels? Give me a detailed analysis',
            'appliance': 'Show me appliance control options and scheduling',
            'emergency': 'I need emergency energy assistance'
        };

        if (actions[action]) {
            this.handleQuickSuggestion(actions[action]);
        }
    }

    showQuickTips() {
        const modal = document.getElementById('quickTipsModal');
        if (!modal) return;

        const tipsList = modal.querySelector('.tips-list');
        if (tipsList) {
            tipsList.innerHTML = `
                <div class="tip-card">
                    <h4>🌡️ AC Optimization</h4>
                    <p>Set AC to 24°C instead of 18°C to save ₹300/month</p>
                    <button class="btn-action" data-action="ac-optimize">Apply Now</button>
                </div>
                <div class="tip-card">
                    <h4>💡 LED Replacement</h4>
                    <p>Replace 5 old bulbs with LEDs to save ₹450/month</p>
                    <button class="btn-action" data-action="led-replace">Order LEDs</button>
                </div>
                <div class="tip-card">
                    <h4>⏰ Smart Scheduling</h4>
                    <p>Schedule water heater to run during off-peak hours</p>
                    <button class="btn-action" data-action="schedule-heater">Set Schedule</button>
                </div>
                <div class="tip-card">
                    <h4>🔌 Standby Power</h4>
                    <p>Turn off appliances at plug point to save ₹150/month</p>
                    <button class="btn-action" data-action="standby-off">Learn How</button>
                </div>
            `;
        }

        modal.classList.add('active');
        modal.removeAttribute('hidden');
        modal.setAttribute('aria-hidden', 'false');
    }

    showEmergencyModal() {
        const modal = document.getElementById('emergencyModal');
        if (!modal) return;

        modal.classList.add('active');
        modal.removeAttribute('hidden');
        modal.setAttribute('aria-hidden', 'false');
    }

    handleEmergency(type) {
        this.hideAllModals();

        let response = '';
        let suggestions = [];

        switch(type) {
            case 'power-outage':
                response = `🚨 **Power Outage Assistance**\n\n1. **Check if it's a local outage:** Ask neighbors\n2. **Report to discom:** Call 1912 or use their app\n3. **Estimated restoration:** Usually 2-4 hours\n4. **Emergency contacts:**\n   • Local electrician: 98765-43210\n   • Discom helpline: 1912\n\nWould you like me to report this outage for you?`;
                suggestions = ['report outage', 'contact electrician', 'check status'];
                break;
            case 'high-bill':
                response = `💰 **Unexpected High Bill Analysis**\n\n**Possible causes:**\n1. Faulty meter reading\n2. Appliance malfunction\n3. Rate change\n4. Increased usage\n\n**Next steps:**\n1. Check meter reading vs bill\n2. Analyze appliance usage\n3. Contact discom for clarification\n4. File dispute if needed\n\nI can help you analyze your usage patterns.`;
                suggestions = ['analyze usage', 'contact discom', 'file dispute'];
                break;
            case 'appliance-fault':
                response = `🔌 **Appliance Malfunction Assistance**\n\n1. **Immediate steps:**\n   • Turn off appliance\n   • Unplug from socket\n   • Check circuit breaker\n\n2. **Diagnosis:**\n   • Check for unusual sounds/smells\n   • Test with another socket\n   • Look for visible damage\n\n3. **Repair services:**\n   • Authorized service: 1800-123-456\n   • Local repair: 98765-43210\n   • Emergency electrician: 98765-43211\n\nWould you like to schedule a repair?`;
                suggestions = ['schedule repair', 'find service center', 'emergency contact'];
                break;
            case 'safety':
                response = `⚠️ **Electrical Safety Emergency**\n\n**If you see sparks/smoke:**\n1. **IMMEDIATELY** turn off main power\n2. **DO NOT** touch with wet hands\n3. **EVACUATE** if major fault\n4. **CALL** emergency services: 101 (Fire)\n\n**Emergency contacts:**\n• Fire: 101\n• Emergency electrician: 98765-43211\n• Discom emergency: 1912\n\n**Stay safe and keep distance!**`;
                suggestions = ['call fire', 'emergency electrician', 'turn off power'];
                break;
        }

        this.addMessage('bot', response, suggestions);
    }

    hideAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
            modal.setAttribute('hidden', 'true');
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-IN';

            this.speechRecognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceStatus('Listening... Speak now');
            };

            this.speechRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleVoiceInput(transcript);
            };

            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.updateVoiceStatus('Error: ' + event.error);
                this.isListening = false;
            };

            this.speechRecognition.onend = () => {
                this.isListening = false;
                this.updateVoiceStatus('Click to speak');
            };
        } else {
            console.warn('Speech recognition not supported');
            this.updateVoiceStatus('Voice not supported in your browser');
        }
    }

    toggleVoiceInput() {
        if (!this.speechRecognition) {
            this.showNotification('Voice recognition not supported in your browser', 'error');
            return;
        }

        if (this.isListening) {
            this.speechRecognition.stop();
            this.isListening = false;
            this.updateVoiceStatus('Stopped listening');
        } else {
            try {
                this.speechRecognition.start();
                this.isListening = true;
            } catch (error) {
                console.error('Failed to start voice recognition:', error);
                this.updateVoiceStatus('Failed to start');
            }
        }
    }

    handleVoiceInput(transcript) {
        this.updateVoiceStatus(`Heard: "${transcript}"`);
        
        // Set transcript in input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = transcript;
            chatInput.focus();
        }

        // Send after short delay
        setTimeout(() => this.sendMessage(), 500);
    }

    updateVoiceStatus(message) {
        const voiceStatus = document.getElementById('voiceStatus');
        if (voiceStatus) {
            voiceStatus.textContent = message;
        }
    }

    showNotification(message, type = 'info') {
        if (window.UrjaSaathi && window.UrjaSaathi.showNotification) {
            window.UrjaSaathi.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize AI Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.AIAssistant = new AIAssistant();
});