
 // State Management
let currentValue = '0';
let previousValue = '';
let operator = null;
let memory = 0;
let history = [];
let soundEnabled = true;

// DOM Elements
const display = document.getElementById('display');
const expression = document.getElementById('expression');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const historyBtn = document.getElementById('historyBtn');
const soundBtn = document.getElementById('soundBtn');
const clearHistoryBtn = document.getElementById('clearHistory');

// Touch/Swipe Detection
let touchStartX = 0;
let touchEndX = 0;

// Initialize
init();

function init() {
    setupEventListeners();
    loadHistory();
    updateDisplay();
}

// Event Listeners
function setupEventListeners() {
    // Button clicks
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', handleButtonClick);
    });
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => changeTheme(btn.dataset.theme));
    });
    
    // History toggle
    historyBtn.addEventListener('click', toggleHistory);
    
    // Sound toggle
    soundBtn.addEventListener('click', toggleSound);
    
    // Clear history
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Swipe to delete
    display.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    display.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
}

// Handle Button Click
function handleButtonClick(e) {
    const btn = e.currentTarget;
    const value = btn.dataset.value;
    const action = btn.dataset.action;
    
    playSound();
    vibrate(10);
    
    // Add ripple effect
    addRipple(btn, e);
    
    if (value) {
        if (btn.classList.contains('btn-number') || value === '.') {
            appendNumber(value);
        } else if (btn.classList.contains('btn-operator')) {
            setOperator(value);
        }
    }
    
    if (action) {
        handleAction(action);
    }
}

// Handle Actions
function handleAction(action) {
    switch(action) {
        case 'clear':
            clear();
            break;
        case 'sign':
            toggleSign();
            break;
        case 'percent':
            percentage();
            break;
        case 'equals':
            calculate();
            break;
        case 'mc':
            memory = 0;
            showToast('Memory Cleared');
            break;
        case 'mr':
            currentValue = memory.toString();
            updateDisplay();
            break;
        case 'm+':
            memory += parseFloat(currentValue);
            showToast(`Memory: ${memory}`);
            break;
        case 'm-':
            memory -= parseFloat(currentValue);
            showToast(`Memory: ${memory}`);
            break;
    }
}

// Calculator Functions
function appendNumber(num) {
    if (currentValue === '0' && num !== '.') {
        currentValue = num;
    } else if (num === '.' && currentValue.includes('.')) {
        return;
    } else {
        currentValue += num;
    }
    updateDisplay();
}

function setOperator(op) {
    if (operator && currentValue !== previousValue) {
        calculate();
    }
    previousValue = currentValue;
    operator = op;
    currentValue = '0';
    updateExpression();
}

function calculate() {
    if (!operator || !previousValue) return;
    
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);
    let result;
    
    switch(operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = current !== 0 ? prev / current : 'Error';
            break;
    }
    
    // Add to history
    addToHistory(`${previousValue} ${getOperatorSymbol(operator)} ${currentValue}`, result);
    
    currentValue = result.toString();
    operator = null;
    previousValue = '';
    updateDisplay();
    updateExpression();
    
    // Celebration animation
    celebrateCalculation();
}

function clear() {
    currentValue = '0';
    previousValue = '';
    operator = null;
    updateDisplay();
    updateExpression();
}

function toggleSign() {
    currentValue = (parseFloat(currentValue) * -1).toString();
    updateDisplay();
}

function percentage() {
    currentValue = (parseFloat(currentValue) / 100).toString();
    updateDisplay();
}

function backspace() {
    if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
    } else {
        currentValue = '0';
    }
    updateDisplay();
}

// Display Updates
function updateDisplay() {
    display.textContent = formatNumber(currentValue);
}

function updateExpression() {
    if (previousValue && operator) {
        expression.textContent = `${formatNumber(previousValue)} ${getOperatorSymbol(operator)}`;
    } else {
        expression.textContent = '';
    }
}

function formatNumber(num) {
    if (num === 'Error') return num;
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function getOperatorSymbol(op) {
    const symbols = {'+': '+', '-': '−', '*': '×', '/': '÷'};
    return symbols[op] || op;
}

// History Functions
function addToHistory(calc, result) {
    history.unshift({
        calculation: calc,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    });
    
    if (history.length > 50) history.pop();
    
    saveHistory();
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No calculations yet</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="calc">${item.calculation}</div>
            <div class="result">= ${formatNumber(item.result.toString())}</div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Clear all history?')) {
        history = [];
        saveHistory();
        renderHistory();
        showToast('History Cleared');
    }
}

function saveHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

function loadHistory() {
    const saved = localStorage.getItem('calcHistory');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
    }
}

function toggleHistory() {
    historyPanel.classList.toggle('active');
    vibrate(15);
}

// Theme Functions
function changeTheme(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.body.className = theme;
    localStorage.setItem('theme', theme);
    vibrate(15);
    showToast('Theme Changed');
}

// Sound & Haptics
function playSound() {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function vibrate(duration = 10) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundBtn.style.opacity = soundEnabled ? '1' : '0.5';
    showToast(soundEnabled ? 'Sound On' : 'Sound Off');
    vibrate(15);
}

// Swipe Handler
function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (swipeDistance < -50) {
        backspace();
        vibrate(20);
    }
}

// Keyboard Support
function handleKeyPress(e) {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '+') setOperator('+');
    if (e.key === '-') setOperator('-');
    if (e.key === '*') setOperator('*');
    if (e.key === '/') {
        e.preventDefault();
        setOperator('/');
    }
    if (e.key === 'Enter' || e.key === '=') calculate();
    if (e.key === 'Escape') clear();
    if (e.key === 'Backspace') backspace();
}

// Visual Effects
function addRipple(button, event) {
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

function celebrateCalculation() {
    display.style.transform = 'scale(1.05)';
    display.style.color = '#4CAF50';
    
    setTimeout(() => {
        display.style.transform = 'scale(1)';
        display.style.color = 'var(--text-color)';
    }, 300);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 10000;
        animation: fadeInOut 2s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.className = savedTheme;
    document.querySelector(`[data-theme="${savedTheme}"]`)?.classList.add('active');
} else {
    document.querySelector('[data-theme="purple"]')?.classList.add('active');
}
                
                  