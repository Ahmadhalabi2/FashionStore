// Interactive Button Effects
class InteractiveEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addStyles();
        this.bindEvents();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ripple-effect {
                position: relative;
                overflow: hidden;
            }
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            .shake-effect {
                animation: shake 0.5s ease-in-out;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            .pulse-effect {
                animation: pulse-glow 1s ease-in-out infinite;
            }
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 5px rgba(78, 205, 196, 0.5); }
                50% { box-shadow: 0 0 20px rgba(78, 205, 196, 0.8), 0 0 30px rgba(78, 205, 196, 0.6); }
            }
            .float-effect {
                animation: float 3s ease-in-out infinite;
            }
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            .glow-border {
                position: relative;
                background: linear-gradient(45deg, transparent, transparent);
                background-clip: padding-box;
            }
            .glow-border::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: -1;
                margin: -2px;
                border-radius: inherit;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
                background-size: 300% 300%;
                animation: gradient-shift 3s ease infinite;
            }
            @keyframes gradient-shift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            .magnetic-effect {
                transition: transform 0.3s ease;
            }
            .bounce-in {
                animation: bounceIn 0.6s ease;
            }
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            .slide-up {
                animation: slideUp 0.5s ease;
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // Add ripple effect to buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, input[type="submit"]')) {
                this.createRipple(e);
            }
        });

        // Add magnetic effect to interactive elements
        document.addEventListener('mousemove', (e) => {
            const magneticElements = document.querySelectorAll('.magnetic-effect');
            magneticElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const distance = Math.sqrt(x * x + y * y);
                
                if (distance < 100) {
                    const strength = (100 - distance) / 100;
                    element.style.transform = `translate(${x * strength * 0.2}px, ${y * strength * 0.2}px)`;
                } else {
                    element.style.transform = 'translate(0, 0)';
                }
            });
        });

        // Reset magnetic effect when mouse leaves
        document.addEventListener('mouseleave', () => {
            const magneticElements = document.querySelectorAll('.magnetic-effect');
            magneticElements.forEach(element => {
                element.style.transform = 'translate(0, 0)';
            });
        });

        // Add entrance animations to elements
        this.observeElements();
    }

    createRipple(event) {
        const button = event.target;
        if (!button || typeof button.getBoundingClientRect !== 'function') return;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        button.classList.add('ripple-effect');
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    observeElements() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('slide-up');
                }
            });
        }, { threshold: 0.1 });

        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll('.product-card, .category-item, .form-group');
        animateElements.forEach(el => observer.observe(el));
    }

    addShakeEffect(element) {
        element.classList.add('shake-effect');
        setTimeout(() => {
            element.classList.remove('shake-effect');
        }, 500);
    }

    addPulseEffect(element) {
        element.classList.add('pulse-effect');
    }

    removePulseEffect(element) {
        element.classList.remove('pulse-effect');
    }

    addFloatEffect(element) {
        element.classList.add('float-effect');
    }

    addGlowBorder(element) {
        element.classList.add('glow-border');
    }

    addMagneticEffect(element) {
        element.classList.add('magnetic-effect');
    }

    addBounceIn(element) {
        element.classList.add('bounce-in');
    }
}

// Initialize interactive effects
document.addEventListener('DOMContentLoaded', () => {
    window.interactiveEffects = new InteractiveEffects();
});