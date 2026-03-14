// ================================================
// NO BORING CALCULATOR PRO - ULTIMATE EDITION
// Premium JavaScript with All Features
// ================================================

class Calculator {
    constructor() {
        this.currentValue = '0';
        this.expression = '';
        this.memory = 0;
        this.history = [];
        this.settings = {
            sound: true,
            haptic: true,
            scientific: false,
            animations: true,
            theme: 'purple-dream',
            darkMode: true
        };
        
        this.init();
    }
    
    init() {
        this.cacheDOMElements();
        this.loadSettings();
        this.setupEventListeners();
        this.createParticles();
        this.hideLoadingScreen();
        this.updateDisplay();
    }
    
    cacheDOMElements() {
        // Displays
        this.displayEl = document.getElementById('display');
        this.expressionEl = document.getElementById('expression');
        
        // Panels
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.themePalette = document.getElementById('themePalette');
        
        // Buttons
        this.buttons = document.querySelectorAll('.btn');
        this.themeButtons = document.querySelectorAll('.theme-card');
        
        // Toast
        this.toastContainer = document.getElementById('toastContainer');
        
        // Touch
        this.touchStartX = 0;
        this.touchEndX = 0;
    }
    
    setupEventListeners() {
        // Number and operator buttons
        this.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleButtonClick(e));
        });
        
        // Theme buttons
        this.themeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.changeTheme(btn.dataset.theme));
        });
        
        // Top bar buttons
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('settingsBtn').addEventListener('click', () => this.toggleSettings());
        
        // History buttons
        document.getElementById('historyBtn').addEventListener('click', () => this.toggleHistory());
        document.getElementById('closeHistory').addEventListener('click', () => this.toggleHistory());
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
        
        // Settings toggles
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.settings.sound = e.target.checked;
            this.saveSettings();
            this.showToast(e.target.checked ? 'Sound On 🔊' : 'Sound Off 🔇');
        });
        
        document.getElementById('hapticToggle').addEventListener('change', (e) => {
            this.settings.haptic = e.target.checked;
            this.saveSettings();
            this.showToast(e.target.checked ? 'Haptics On 📳' : 'Haptics Off');
        });
        
        document.getElementById('scientificToggle').addEventListener('change', (e) => {
            this.settings.scientific = e.target.checked;
            this.saveSettings();
            document.getElementById('scientificRow').style.display = e.target.checked ? 'grid' : 'none';
            this.showToast(e.target.checked ? 'Scientific Mode 🔬' : 'Basic Mode');
        });
        
        document.getElementById('animationsToggle').addEventListener('change', (e) => {
            this.settings.animations = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('closeSettings').addEventListener('click', () => this.toggleSettings());
        
        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        
        // Swipe gesture
        this.displayEl.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });
        
        this.displayEl.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Scientific functions
        document.querySelectorAll('.btn-scientific').forEach(btn => {
            btn.addEventListener('click', () => this.handleScientific(btn.dataset.fn));
        });
        
        // Memory buttons
        document.querySelectorAll('.btn-memory').forEach(btn => {
            btn.addEventListener('click', () => this.handleMemory(btn.dataset.mem));
        });
        
        // Click outside to close panels
        document.addEventListener('click', (e) => {
            if (!this.themePalette.contains(e.target) && 
                !document.getElementById('settingsBtn').contains(e.target)) {
                this.themePalette.classList.remove('active');
            }
        });
    }
    
    handleButtonClick(e) {
        const btn = e.currentTarget;
        const value = btn.dataset.value;
        const action = btn.dataset.action;
        
        // Effects
        this.playSound();
        this.vibrate();
        this.addRipple(btn, e);
        
        // Handle input
        if (value !== undefined) {
            if (btn.classList.contains('btn-number') || value === '.') {
                this.appendNumber(value);
            } else if (btn.classList.contains('btn-operator')) {
                this.appendOperator(value);
            }
        }
        
        if (action) {
            this.handleAction(action);
        }
    }
    
    handleAction(action) {
        switch(action) {
            case 'ac':
                this.clear();
                break;
            case 'parenthesis':
                this.addParenthesis();
                break;
            case 'percent':
                this.percentage();
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }
    
    appendNumber(num) {
        if (this.currentValue === '0' && num !== '.') {
            this.currentValue = num;
        } else if (num === '.' && this.currentValue.includes('.')) {
            return;
        } else {
            this.currentValue += num;
        }
        this.updateDisplay();
    }
    
    appendOperator(op) {
        if (this.currentValue) {
            this.expression += this.currentValue + ' ' + this.getOperatorSymbol(op) + ' ';
            this.currentValue = '';
            this.updateDisplay();
        }
    }
    
    addParenthesis() {
        const openCount = (this.expression.match(/\(/g) || []).length;
        const closeCount = (this.expression.match(/\)/g) || []).length;
        
        if (openCount === closeCount) {
            this.expression += '(';
        } else {
            this.expression += ')';
        }
        this.updateDisplay();
    }
    
    percentage() {
        if (this.currentValue) {
            this.currentValue = (parseFloat(this.currentValue) / 100).toString();
            this.updateDisplay();
        }
    }
    
    calculate() {
        try {
            if (!this.currentValue && !this.expression) return;
            
            const fullExpression = this.expression + this.currentValue;
            const sanitized = fullExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-');
            
            const result = eval(sanitized);
            
            // Add to history
            this.addToHistory(fullExpression, result);
            
            // Celebration effect
            this.celebrateCalculation();
            
            // Update display
            this.expression = '';
            this.currentValue = this.formatResult(result);
            this.updateDisplay();
            
        } catch (error) {
            this.showToast('Invalid Expression ❌');
            this.vibrate(30);
        }
    }
    
    clear() {
        this.currentValue = '0';
        this.expression = '';
        this.updateDisplay();
    }
    
    clearAll() {
        this.clear();
        this.showToast('Cleared ✨');
    }
    
    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }
    
    handleSwipe() {
        const swipeDistance = this.touchStartX - this.touchEndX;
        if (swipeDistance > 50) {
            this.backspace();
            this.vibrate(20);
        }
    }
    
    handleKeyboard(e) {
        const key = e.key;
        
        if (key >= '0' && key <= '9') this.appendNumber(key);
        if (key === '.') this.appendNumber('.');
        if (key === '+') this.appendOperator('+');
        if (key === '-') this.appendOperator('-');
        if (key === '*') this.appendOperator('*');
        if (key === '/') {
            e.preventDefault();
            this.appendOperator('/');
        }
        if (key === 'Enter' || key === '=') this.calculate();
        if (key === 'Escape') this.clear();
        if (key === 'Backspace') this.backspace();
        if (key === '(' || key === ')') this.expression += key;
        if (key === '%') this.percentage();
    }
    
    handleScientific(fn) {
        const value = parseFloat(this.currentValue);
        let result;
        
        switch(fn) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(value * Math.PI / 180);
                break;
            case 'sqrt':
                result = Math.sqrt(value);
                break;
            case 'pow':
                result = Math.pow(value, 2);
                break;
            case 'pi':
                this.currentValue = Math.PI.toString();
                this.updateDisplay();
                return;
        }
        
        this.currentValue = this.formatResult(result);
        this.updateDisplay();
    }
    
    handleMemory(action) {
        const value = parseFloat(this.currentValue);
        
        switch(action) {
            case 'mc':
                this.memory = 0;
                this.showToast('Memory Cleared 🗑️');
                break;
            case 'mr':
                this.currentValue = this.memory.toString();
                this.updateDisplay();
                this.showToast(`Memory Recall: ${this.memory}`);
                break;
            case 'm+':
                this.memory += value;
                this.showToast(`Memory +: ${this.memory}`);
                break;
            case 'm-':
                this.memory -= value;
                this.showToast(`Memory -: ${this.memory}`);
                break;
        }
    }
    
    updateDisplay() {
        this.displayEl.textContent = this.formatNumber(this.currentValue);
        
        if (this.expression) {
            this.expressionEl.innerHTML = this.expression;
        } else {
            this.expressionEl.innerHTML = '<span class="placeholder">Start calculating...</span>';
        }
    }
    
    formatNumber(num) {
        if (num === 'Error' || isNaN(num)) return '0';
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }
    
    formatResult(num) {
        if (isNaN(num) || !isFinite(num)) return 'Error';
        return Number(num.toFixed(10)).toString();
    }
    
    getOperatorSymbol(op) {
        const symbols = {'+': '+', '-': '−', '*': '×', '/': '÷'};
        return symbols[op] || op;
    }
    
    // History Management
    addToHistory(expression, result) {
        const historyItem = {
            expression,
            result: this.formatResult(result),
            timestamp: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 100) this.history.pop();
        
        this.saveHistory();
        this.renderHistory();
    }
    
    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p>No calculations yet</p>
                    <span>Your history will appear here</span>
                </div>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.history.map((item, index) => `
            <div class="history-item" data-index="${index}">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${this.formatNumber(item.result)}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('');
        
        // Add click listeners to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = item.dataset.index;
                this.loadFromHistory(index);
            });
        });
    }
    
    loadFromHistory(index) {
        const item = this.history[index];
        this.currentValue = item.result;
        this.expression = '';
        this.updateDisplay();
        this.toggleHistory();
        this.showToast('Loaded from history ↩️');
    }
    
    clearHistory() {
        if (confirm('Clear all history?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            this.showToast('History cleared 🗑️');
        }
    }
    
    toggleHistory() {
        this.historyPanel.classList.toggle('active');
        this.vibrate();
    }
    
    // Theme Management
    changeTheme(theme) {
        document.body.className = theme;
        if (!this.settings.darkMode) {
            document.body.classList.add('light-theme');
        }
        
        this.settings.theme = theme;
        this.saveSettings();
        
        // Update active button
        this.themeButtons.forEach(btn => btn.classList.remove('active'));
        event.target.closest('.theme-card').classList.add('active');
        
        this.showToast('Theme changed 🎨');
        this.vibrate();
    }
    
    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        document.body.classList.toggle('light-theme');
        this.saveSettings();
        this.showToast(this.settings.darkMode ? 'Dark Mode 🌙' : 'Light Mode ☀️');
        this.vibrate();
    }
    
    toggleSettings() {
        this.settingsPanel.classList.toggle('active');
        this.vibrate();
    }
    
    // Effects
    playSound() {
        if (!this.settings.sound) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.08);
        } catch (error) {
            // Audio not supported
        }
    }
    
    vibrate(duration = 10) {
        if (!this.settings.haptic) return;
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }
    
    addRipple(button, event) {
        if (!this.settings.animations) return;
        
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
    
    celebrateCalculation() {
        if (!this.settings.animations) return;
        
        this.displayEl.style.transform = 'scale(1.05)';
        this.displayEl.style.color = '#34c759';
        
        setTimeout(() => {
            this.displayEl.style.transform = 'scale(1)';
            this.displayEl.style.color = 'var(--text-primary)';
        }, 300);
        
        this.vibrate(25);
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 10;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }
    
    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 1000);
    }
    
    // Storage
    saveSettings() {
        localStorage.setItem('calcSettings', JSON.stringify(this.settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('calcSettings');
        if (saved) {
            this.settings = {...this.settings, ...JSON.parse(saved)};
            
            // Apply settings
            document.body.className = this.settings.theme;
            if (!this.settings.darkMode) {
                document.body.classList.add('light-theme');
            }
            
            document.getElementById('soundToggle').checked = this.settings.sound;
            document.getElementById('hapticToggle').checked = this.settings.haptic;
            document.getElementById('scientificToggle').checked = this.settings.scientific;
            document.getElementById('animationsToggle').checked = this.settings.animations;
            
            if (this.settings.scientific) {
                document.getElementById('scientificRow').style.display = 'grid';
            }
            
            // Set active theme button
            const activeThemeBtn = document.querySelector(`[data-theme="${this.settings.theme}"]`);
            if (activeThemeBtn) {
                this.themeButtons.forEach(btn => btn.classList.remove('active'));
                activeThemeBtn.classList.add('active');
            }
        }
    }
    
    saveHistory() {
        localStorage.setItem('calcHistory', JSON.stringify(this.history));
    }
    
    loadHistory() {
        const saved = localStorage.getItem('calcHistory');
        if (saved) {
            this.history = JSON.parse(saved);
            this.renderHistory();
        }
    }
}

// Initialize Calculator
const calculator = new Calculator();

// Load history after initialization
calculator.loadHistory();

// Easter Egg - Konami Code
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiPattern.join(',')) {
        calculator.showToast('🎮 Easter Egg Unlocked! 🎊');
        document.body.style.animation = 'rainbow 2s linear infinite';
    }
});