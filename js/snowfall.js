/**
 * Lightweight Canvas Snowfall
 */

const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let snowflakes = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Snowflake {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = Math.random() * 1 + 0.5;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.y > height) {
            this.y = -10;
            this.x = Math.random() * width;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

function init() {
    resize();
    snowflakes = Array.from({ length: 50 }, () => new Snowflake());
    loop();
}

function loop() {
    ctx.clearRect(0, 0, width, height);
    snowflakes.forEach(f => {
        f.update();
        f.draw();
    });
    requestAnimationFrame(loop);
}

window.addEventListener('resize', resize);
init();