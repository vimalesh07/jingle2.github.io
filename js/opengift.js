import { db } from './database.js';

// DOM Elements
const stage = document.getElementById('main-stage');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error-msg');
const sceneBox = document.getElementById('scene-box');
const sceneReveal = document.getElementById('scene-reveal');

// Data Elements
const receiverNameEl = document.getElementById('receiver-name');
const senderNameEl = document.getElementById('sender-name');
const messageTextEl = document.getElementById('message-text');
const voicePlayer = document.getElementById('voice-player');
const photoContainer = document.getElementById('photo-container');
const voiceSection = document.getElementById('reveal-voice');
const photoSection = document.getElementById('reveal-photo');

// Extract Gift ID
const urlParams = new URLSearchParams(window.location.search);
const giftId = urlParams.get('giftId');

async function loadGift() {
    if (!giftId) {
        showError();
        return;
    }

    try {
        const gift = await db.getGift(giftId);
        if (!gift) throw new Error('Gift not found');

        // Populate Data
        receiverNameEl.textContent = gift.receiver_name;
        senderNameEl.textContent = gift.sender_name;
        messageTextEl.textContent = gift.message || "A warm holiday greeting for you!";

        // Handle Voice
        if (gift.voice_url) {
            voicePlayer.src = gift.voice_url;
        } else {
            voiceSection.style.display = 'none';
        }

        // Handle Photos
        if (gift.photos && gift.photos.length > 0) {
            gift.photos.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.loading = 'lazy';
                img.style.marginBottom = '1rem';
                img.style.boxShadow = 'var(--shadow-elevation)';
                photoContainer.appendChild(img);
            });
        } else {
            photoSection.style.display = 'none';
        }

        // Ready to start
        loading.style.display = 'none';
        sceneBox.style.display = 'flex'; // Box Scene

        // Mark as opened silently
        db.markOpened(giftId).catch(console.error);

    } catch (err) {
        console.error(err);
        showError();
    }
}

function showError() {
    loading.style.display = 'none';
    errorMsg.style.display = 'block';
}

/**
 * Story Engine / Reveal Animation
 */
const giftBox = document.getElementById('gift-box-trigger');

giftBox.addEventListener('click', () => {
    // 1. Animate Box Away (Zoom + Fade)
    giftBox.style.transform = 'scale(5) rotate(10deg)';
    giftBox.style.opacity = '0';

    // Quick timeout to switch scenes
    setTimeout(() => {
        sceneBox.style.display = 'none';
        sceneReveal.style.display = 'block';
        playRevealSequence();
    }, 500);
});

function playRevealSequence() {
    const sequence = [
        { id: 'reveal-sender', delay: 100 },
        { id: 'reveal-message', delay: 800 },
        { id: 'reveal-voice', delay: 1500 },
        { id: 'reveal-photo', delay: 2200 }
    ];

    sequence.forEach(item => {
        const el = document.getElementById(item.id);
        if (el && el.style.display !== 'none') {
            setTimeout(() => {
                el.classList.add('reveal-active');
            }, item.delay);
        }
    });

    // Auto-play voice if available (browser policy might block this if not triggered by exact click interaction chain, but we just clicked the box, so it MIGHT work on some browsers, else user plays it manually)
    // Attempting auto-play after a delay
    if (voicePlayer.src) {
        setTimeout(() => {
            voicePlayer.play().catch(() => console.log('Autoplay blocked - user must click play'));
        }, 1800);
    }
}

// Init
loadGift();