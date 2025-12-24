// Snowfall Animation
class Snowfall {
    constructor() {
        this.container = document.querySelector('.snowflakes');
        this.snowflakes = [];
        this.flakeCount = 50;
        this.animationId = null;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        // Create snowflakes
        this.createSnowflakes();
        
        // Start animation
        this.start();
        
        // Handle visibility changes
        this.setupVisibilityHandler();
        
        // Handle window resize
        this.setupResizeHandler();
    }
    
    createSnowflakes() {
        // Clear existing snowflakes
        this.container.innerHTML = '';
        this.snowflakes = [];
        
        for (let i = 0; i < this.flakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            
            // Random properties
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const opacity = Math.random() * 0.8 + 0.2;
            const speed = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            const wind = Math.random() * 50 - 25;
            
            // Apply styles
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${left}vw`;
            snowflake.style.opacity = opacity;
            snowflake.style.borderRadius = '50%';
            snowflake.style.background = 'white';
            snowflake.style.position = 'absolute';
            snowflake.style.pointerEvents = 'none';
            snowflake.style.filter = 'blur(1px)';
            snowflake.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.5)';
            snowflake.style.zIndex = '1';
            snowflake.style.top = '-20px';
            
            // Store properties
            snowflake.dataset.speed = speed;
            snowflake.dataset.delay = delay;
            snowflake.dataset.wind = wind;
            snowflake.dataset.originalLeft = left;
            
            this.container.appendChild(snowflake);
            this.snowflakes.push(snowflake);
        }
    }
    
    start() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animate();
    }
    
    stop() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        const currentTime = Date.now() / 1000;
        
        this.snowflakes.forEach((flake, index) => {
            const speed = parseFloat(flake.dataset.speed);
            const delay = parseFloat(flake.dataset.delay);
            const wind = parseFloat(flake.dataset.wind);
            const originalLeft = parseFloat(flake.dataset.originalLeft);
            
            // Calculate position
            const time = currentTime + delay;
            const vertical = (time * speed) % 100;
            const horizontal = Math.sin(time * 0.5 + index) * wind;
            
            // Update position
            flake.style.top = `${vertical}vh`;
            flake.style.left = `${originalLeft + (horizontal / window.innerWidth * 100)}vw`;
            
            // Reset if out of view
            if (vertical >= 100) {
                flake.style.top = '-20px';
                flake.dataset.originalLeft = Math.random() * 100;
            }
            
            // Add subtle rotation
            flake.style.transform = `rotate(${time * 20}deg)`;
            
            // Add wobble effect
            const wobble = Math.sin(time * 2) * 2;
            flake.style.transform += ` translateX(${wobble}px)`;
        });
        
        if (this.isAnimating) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }
    
    setupVisibilityHandler() {
        // Pause animation when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        });
    }
    
    setupResizeHandler() {
        // Throttle resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Reposition snowflakes based on new window size
                this.snowflakes.forEach(flake => {
                    const originalLeft = parseFloat(flake.dataset.originalLeft);
                    flake.style.left = `${originalLeft}vw`;
                });
            }, 250);
        });
    }
    
    updateDensity(density) {
        // Adjust number of snowflakes
        this.flakeCount = Math.max(10, Math.min(200, density));
        this.createSnowflakes();
    }
    
    // Add extra snowflakes for celebration
    addExtraSnowflakes(count) {
        const extraCount = count || 30;
        
        for (let i = 0; i < extraCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake extra';
            
            // Random properties with more variation
            const size = Math.random() * 15 + 5;
            const left = Math.random() * 100;
            const opacity = Math.random() * 0.9 + 0.1;
            const speed = Math.random() * 30 + 15;
            const delay = Math.random() * 10;
            const wind = Math.random() * 100 - 50;
            
            // Apply styles
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${left}vw`;
            snowflake.style.opacity = opacity;
            snowflake.style.borderRadius = '50%';
            snowflake.style.background = this.getRandomColor();
            snowflake.style.position = 'fixed';
            snowflake.style.pointerEvents = 'none';
            snowflake.style.filter = 'blur(2px)';
            snowflake.style.boxShadow = '0 0 10px currentColor';
            snowflake.style.zIndex = '100';
            snowflake.style.top = '-30px';
            
            // Store properties
            snowflake.dataset.speed = speed;
            snowflake.dataset.delay = delay;
            snowflake.dataset.wind = wind;
            snowflake.dataset.originalLeft = left;
            
            document.body.appendChild(snowflake);
            
            // Animate this snowflake separately
            this.animateExtraSnowflake(snowflake);
        }
    }
    
    getRandomColor() {
        const colors = [
            '#ffffff', // White
            '#f1c40f', // Gold
            '#e74c3c', // Red
            '#2ecc71', // Green
            '#3498db'  // Blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    animateExtraSnowflake(flake) {
        let startTime = Date.now();
        const speed = parseFloat(flake.dataset.speed) / 1000;
        const delay = parseFloat(flake.dataset.delay);
        const wind = parseFloat(flake.dataset.wind);
        const originalLeft = parseFloat(flake.dataset.originalLeft);
        
        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000 + delay;
            const vertical = (elapsed * speed * 100) % 100;
            
            if (vertical >= 100) {
                flake.remove();
                return;
            }
            
            const horizontal = Math.sin(elapsed * 0.5) * wind;
            
            flake.style.top = `${vertical}vh`;
            flake.style.left = `${originalLeft + (horizontal / window.innerWidth * 100)}vw`;
            flake.style.transform = `rotate(${elapsed * 50}deg)`;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
}

// Initialize snowfall when DOM is loaded
let snowfallInstance;

document.addEventListener('DOMContentLoaded', () => {
    snowfallInstance = new Snowfall();
    
    // Add celebration snowflakes after gift opening
    window.addEventListener('giftOpened', () => {
        if (snowfallInstance) {
            snowfallInstance.addExtraSnowflakes(50);
        }
    });
});

// Export for use in other scripts
window.Snowfall = snowfallInstance;