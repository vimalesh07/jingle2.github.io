document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.snowflakes');
    if (!container) return;

    // Create snowflakes
    const COUNT = 50;
    for (let i = 0; i < COUNT; i++) {
        createSnowflake(container);
    }
});

function createSnowflake(container) {
    const flake = document.createElement('div');
    flake.classList.add('snowflake');

    // Randomize
    const leftInit = Math.random() * 100 + 'vw';
    const leftEnd = (Math.random() * 100 - 50 + parseFloat(leftInit)) + 'vw'; // Drift
    const duration = Math.random() * 5 + 5 + 's'; // 5-10s
    const delay = Math.random() * -10 + 's'; // Start at random times
    const size = Math.random() * 5 + 2 + 'px';
    const opacity = Math.random() * 0.5 + 0.3;

    flake.style.setProperty('--left-init', leftInit);
    flake.style.setProperty('--left-end', leftEnd);
    flake.style.width = size;
    flake.style.height = size;
    flake.style.opacity = opacity;
    flake.style.animationDuration = duration;
    flake.style.animationDelay = delay;

    container.appendChild(flake);
}