// Advanced Notification System
class NotificationManager {
    constructor() {
        this.container = null;
        this.sounds = {
            success: this.createBeep(800, 100),
            error: this.createBeep(300, 200),
            info: this.createBeep(600, 150),
            warning: this.createBeep(400, 180)
        };
        this.init();
    }

    init() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.innerHTML = `
            <style>
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    pointer-events: none;
                }
                .notification {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 20px;
                    margin-bottom: 10px;
                    border-radius: 10px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    transform: translateX(400px);
                    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    pointer-events: auto;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    min-width: 300px;
                    max-width: 400px;
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification.success {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                }
                .notification.error {
                    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                }
                .notification.warning {
                    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
                    color: #333;
                }
                .notification.info {
                    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
                    color: #333;
                }
                .notification::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: rgba(255,255,255,0.5);
                    animation: progress 4s linear;
                }
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .notification-icon {
                    display: inline-block;
                    margin-right: 10px;
                    font-size: 18px;
                }
                .notification-content {
                    display: inline-block;
                    vertical-align: top;
                }
                .notification-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .notification-message {
                    font-size: 14px;
                    opacity: 0.9;
                }
            </style>
        `;
        document.body.appendChild(this.container);
    }

    createBeep(frequency, duration) {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        };
    }

    show(message, type = 'info', title = '', duration = 4000) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${icons[type]}</span>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
        `;

        this.container.appendChild(notification);

        // Play sound
        try {
            this.sounds[type]();
        } catch (e) {
            console.log('Audio not supported');
        }

        // Show animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, duration);

        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        });
    }

    success(message, title = 'نجح!') {
        this.show(message, 'success', title);
    }

    error(message, title = 'خطأ!') {
        this.show(message, 'error', title);
    }

    warning(message, title = 'تحذير!') {
        this.show(message, 'warning', title);
    }

    info(message, title = 'معلومة') {
        this.show(message, 'info', title);
    }
}

// Initialize global notification manager
window.notify = new NotificationManager();