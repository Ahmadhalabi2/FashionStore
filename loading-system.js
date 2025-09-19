// Advanced Loading System
class LoadingSystem {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <style>
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 99999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                .loading-overlay.show {
                    opacity: 1;
                    visibility: visible;
                }
                .loading-content {
                    text-align: center;
                    color: white;
                }
                .loading-spinner {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 20px;
                    position: relative;
                }
                .spinner-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 4px solid transparent;
                    border-top: 4px solid #fff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .spinner-ring:nth-child(2) {
                    width: 60px;
                    height: 60px;
                    top: 10px;
                    left: 10px;
                    border-top-color: #4ecdc4;
                    animation-duration: 0.8s;
                    animation-direction: reverse;
                }
                .spinner-ring:nth-child(3) {
                    width: 40px;
                    height: 40px;
                    top: 20px;
                    left: 20px;
                    border-top-color: #ff6b6b;
                    animation-duration: 0.6s;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-text {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 10px;
                    animation: pulse 2s ease-in-out infinite;
                }
                .loading-progress {
                    width: 200px;
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    margin: 0 auto;
                    overflow: hidden;
                }
                .loading-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #4ecdc4, #44a08d);
                    border-radius: 2px;
                    width: 0%;
                    transition: width 0.3s ease;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .loading-dots {
                    display: flex;
                    justify-content: center;
                    margin-top: 15px;
                }
                .loading-dot {
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                    margin: 0 3px;
                    animation: bounce 1.4s ease-in-out infinite both;
                }
                .loading-dot:nth-child(1) { animation-delay: -0.32s; }
                .loading-dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    }
                    40% {
                        transform: scale(1);
                    }
                }
            </style>
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-text">جاري التحميل...</div>
                <div class="loading-progress">
                    <div class="loading-progress-bar"></div>
                </div>
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    show(text = 'جاري التحميل...', duration = 2000) {
        const textElement = this.overlay.querySelector('.loading-text');
        const progressBar = this.overlay.querySelector('.loading-progress-bar');
        
        textElement.textContent = text;
        this.overlay.classList.add('show');
        
        // Animate progress bar
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            progressBar.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => this.hide(), 500);
            }
        }, duration / 10);
        
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    hide() {
        this.overlay.classList.remove('show');
        const progressBar = this.overlay.querySelector('.loading-progress-bar');
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 300);
    }

    showWithCallback(text, callback) {
        const textElement = this.overlay.querySelector('.loading-text');
        const progressBar = this.overlay.querySelector('.loading-progress-bar');
        
        textElement.textContent = text;
        this.overlay.classList.add('show');
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 90) progress = 90;
            progressBar.style.width = progress + '%';
        }, 100);
        
        // Execute callback
        Promise.resolve(callback()).then(() => {
            clearInterval(interval);
            progressBar.style.width = '100%';
            setTimeout(() => this.hide(), 500);
        });
    }
}

// Initialize global loading system
window.loading = new LoadingSystem();