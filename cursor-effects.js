// Interactive Cursor Effects
class CursorEffects {
    constructor() {
        this.cursor = null;
        this.follower = null;
        this.particles = [];
        this.init();
    }

    init() {
        // Create custom cursor
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        
        this.follower = document.createElement('div');
        this.follower.className = 'cursor-follower';

        const style = document.createElement('style');
        style.textContent = `
            .custom-cursor {
                position: fixed;
                width: 20px;
                height: 20px;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: all 0.1s ease;
                box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            }
            .cursor-follower {
                position: fixed;
                width: 40px;
                height: 40px;
                border: 2px solid rgba(255, 107, 107, 0.3);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                transform: translate(-50%, -50%);
                transition: all 0.3s ease;
            }
            .custom-cursor.hover {
                transform: translate(-50%, -50%) scale(1.5);
                background: linear-gradient(45deg, #4ecdc4, #45b7d1);
            }
            .cursor-follower.hover {
                transform: translate(-50%, -50%) scale(1.2);
                border-color: rgba(78, 205, 196, 0.5);
            }
            .cursor-particle {
                position: fixed;
                width: 4px;
                height: 4px;
                background: #ff6b6b;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9997;
                animation: particle-fade 1s ease-out forwards;
            }
            @keyframes particle-fade {
                0% {
                    opacity: 1;
                    transform: scale(1);
                }
                100% {
                    opacity: 0;
                    transform: scale(0) translateY(-20px);
                }
            }
            body {
                cursor: none !important;
            }
            a, button, input, select, textarea, .clickable {
                cursor: none !important;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(this.cursor);
        document.body.appendChild(this.follower);

        this.bindEvents();
    }

    bindEvents() {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            this.cursor.style.left = mouseX + 'px';
            this.cursor.style.top = mouseY + 'px';

            // Create particle trail
            if (Math.random() > 0.8) {
                this.createParticle(mouseX, mouseY);
            }
        });

        // Smooth follower animation
        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            
            this.follower.style.left = followerX + 'px';
            this.follower.style.top = followerY + 'px';
            
            requestAnimationFrame(animateFollower);
        };
        animateFollower();

        // Hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('a, button, input, select, textarea, .clickable, .btn')) {
                this.cursor.classList.add('hover');
                this.follower.classList.add('hover');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('a, button, input, select, textarea, .clickable, .btn')) {
                this.cursor.classList.remove('hover');
                this.follower.classList.remove('hover');
            }
        });

        // Click effect
        document.addEventListener('click', (e) => {
            this.createClickEffect(e.clientX, e.clientY);
        });
    }

    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'cursor-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }

    createClickEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'cursor-particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = '#4ecdc4';
            
            const angle = (i / 8) * Math.PI * 2;
            const velocity = 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.animation = 'none';
            particle.style.transition = 'all 0.6s ease-out';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.style.transform = `translate(${vx}px, ${vy}px) scale(0)`;
                particle.style.opacity = '0';
            }, 10);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 600);
        }
    }
}

// Initialize cursor effects
document.addEventListener('DOMContentLoaded', () => {
    new CursorEffects();
});