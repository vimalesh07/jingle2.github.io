import { db } from './database.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const giftId = params.get('id');
    const isPreview = params.get('preview') === 'true';

    // Elements
    const giftBox = document.getElementById('giftBox');
    const openBtn = document.getElementById('openBtn');
    const giftContent = document.getElementById('giftContent');
    const greeting = document.getElementById('greeting');
    const envelope = document.getElementById('envelope');

    let giftData = null;

    // --- 1. Load Data ---
    if (isPreview) {
        giftData = {
            sender_name: "Preview User",
            receiver_name: "You",
            message: "This is a preview of your beautiful message. It will look just like this!",
            photos: [], // Add dummy if needed
            voice_url: null
        };
        initGift(giftData);
    } else if (giftId) {
        try {
            giftData = await db.getGift(giftId);
            initGift(giftData);
        } catch (error) {
            console.error(error);
            greeting.innerText = "Gift not found or expired.";
            openBtn.style.display = 'none';
        }
    } else {
        greeting.innerText = "No gift ID provided.";
        openBtn.style.display = 'none';
    }

    // --- 2. Initialize UI ---
    function initGift(data) {
        greeting.innerHTML = `From <strong>${data.sender_name}</strong> to <strong>${data.receiver_name}</strong>`;

        // Setup Photo
        const photoImg = document.getElementById('giftPhoto');
        if (data.photos && data.photos.length > 0) {
            photoImg.src = data.photos[0];
            document.getElementById('photoMessage').innerText = "A captured moment...";
        } else {
            document.querySelector('.photo-memory').style.display = 'none';
        }

        // Setup Letter
        const letterContent = document.getElementById('letterContent');
        if (data.message) {
            letterContent.innerHTML = `
                <p><strong>Dear ${data.receiver_name},</strong></p>
                <p>${data.message.replace(/\n/g, '<br>')}</p>
                <br>
                <p style="text-align: right;">With love,<br><strong>${data.sender_name}</strong></p>
            `;
        }

        // Setup Voice
        const audio = document.getElementById('voiceAudio');
        if (data.voice_url) {
            audio.src = data.voice_url;
        } else {
            document.querySelector('.voice-message').style.display = 'none';
        }
    }

    // --- 3. Interaction Logic ---
    let isOpen = false;
    let currentStep = 0;

    // Attach nextStep to window for HTML onClick access
    window.nextStep = (stepNumber) => {
        const current = document.getElementById(`step${stepNumber - 1}`);
        const next = document.getElementById(`step${stepNumber}`);

        // 1. Exit current step
        if (current) {
            current.classList.remove('animate-float-in'); // Reset entrance
            const card = current.querySelector('.glass-card') || current.querySelector('.envelope-container');
            if (card) {
                card.classList.add('animate-exit');
            }

            // Wait for exit animation then hide
            setTimeout(() => {
                current.style.display = 'none';

                // 2. Enter next step
                if (next) {
                    next.style.display = 'block';
                    // Trigger entrance animation on the inner card
                    const nextCard = next.querySelector('.glass-card') || next.querySelector('.envelope-container');
                    if (nextCard) {
                        nextCard.classList.remove('animate-exit');
                        nextCard.classList.add('animate-float-in');
                    }
                }
            }, 600); // 0.6s exit duation match
        }
    };

    // Open Handler
    const handleOpen = () => {
        if (isOpen) return;
        isOpen = true;

        // Sound
        playMagicalSound();

        // 1. Shake Animation
        giftBox.classList.add('animate-shake');

        // 2. Open Box (after shake)
        setTimeout(() => {
            giftBox.classList.remove('animate-shake');
            giftBox.classList.add('open');
            openBtn.style.opacity = 0;

            // Fade out the container
            const container = document.getElementById('giftBoxContainer');
            container.style.transition = 'opacity 1s ease';
            container.style.opacity = '0';

            setTimeout(() => {
                container.style.display = 'none'; // Remove it flow
            }, 1000);

            // 3. Start Story Mode Phase 1
            giftContent.style.display = 'block';

            // Wait for box to disappear slightly then show Step 1
            setTimeout(() => {
                const step1 = document.getElementById('step1');
                step1.style.display = 'block';
                // Ensure animation runs
                const card = step1.querySelector('.glass-card');
                if (card) card.classList.add('animate-float-in');

                // Confetti
                startCelebration();
            }, 800);

        }, 500);
    };

    openBtn.addEventListener('click', handleOpen);
    giftBox.addEventListener('click', handleOpen);

    // Envelope Logic
    if (envelope) {
        envelope.addEventListener('click', () => {
            if (!envelope.classList.contains('open')) {
                envelope.classList.add('open');
                // Show the "Next" button after letter opens
                setTimeout(() => {
                    const btn = document.getElementById('btnToAudio');
                    if (btn) {
                        btn.style.display = 'inline-block';
                        btn.style.opacity = 1;
                    }
                }, 1000);
            }
        });
    }
});

// --- Audio Synthesis (No external assets needed) ---
function playMagicalSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Chime sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // Slide up

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

        osc.start();
        osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
        console.warn("Audio Context error", e);
    }
}

function startCelebration() {
    // Uses the snowfall.js logic implicitly for snow, 
    // adds confetti manually here
    const colors = ['#f1c40f', '#e74c3c', '#2ecc71', '#3498db'];

    // Burst of confetti
    for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.className = 'confetti';
        div.style.left = '50%';
        div.style.top = '50%';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Random velocity for "explosion"
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 500 + 200; // pixels per sec equivalent
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        div.style.transition = 'transform 1s ease-out, opacity 1s ease-in';
        div.style.transform = `translate(${tx}px, ${ty}px)`;

        document.body.appendChild(div);

        setTimeout(() => {
            div.style.opacity = 0;
            setTimeout(() => div.remove(), 1000);
        }, 100); // Start moving immediately
    }
}