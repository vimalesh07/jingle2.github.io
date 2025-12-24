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
            photos: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
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
            if (photoImg) photoImg.style.display = 'none';
            const photoContainer = document.querySelector('.photo-container');
            if (photoContainer) photoContainer.style.display = 'none';
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
            const voiceMsg = document.querySelector('.voice-message');
            if (voiceMsg) voiceMsg.style.display = 'none';
        }
    }

    // --- 3. Interaction Logic ---
    let isOpen = false;

    // Ensure Initial State (Locked Closed)
    gsap.set(".box-lid", {
        y: 0,
        rotationX: 0,
        rotationZ: 0,
        opacity: 1
    });

    // Handle Open: PRODUCTION READY ("Cinematic Dive")
    const handleOpen = () => {
        if (isOpen) return;
        isOpen = true;

        playMagicalSound();

        // Master Timeline with high-quality easing
        const tl = gsap.timeline();

        // 1. Anticipation (Slight compression)
        tl.to(".gift-box", {
            scaleY: 0.95,
            scaleX: 1.02,
            duration: 0.2,
            ease: "power2.out"
        });

        // 2. EXPLOSIVE Opening (Lid Flies, Box Recoils)
        // Lid shoots off
        tl.to(".box-lid", {
            y: -600,
            x: 200,
            rotationX: 140,
            rotationZ: 25,
            opacity: 0,
            duration: 1.2,
            ease: "power3.inOut" // Distinctive "Throw" curve
        }, "burst");

        // Box snaps back and starts "Diving" (Scaling Up)
        tl.to(".gift-box", {
            scaleY: 1,
            scaleX: 1,
            duration: 0.1,
            ease: "elastic.out(1, 0.5)"
        }, "burst");

        // 3. The "Dive Through" Transition (The Magic Glue)
        // We scale the container UP towards the camera while fading it out
        // This simulates moving INSIDE the box to reveal the content
        tl.to("#giftBoxContainer", {
            scale: 2.5,
            opacity: 0,
            filter: "blur(10px)", // Motion blur feel
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                const container = document.getElementById('giftBoxContainer');
                if (container) container.style.display = 'none';
            }
        }, "-=0.8"); // Start overlapping with the lid flight

        openBtn.style.opacity = 0;

        // 4. Content Reveal (Emerges from the blur)
        setTimeout(() => {
            giftContent.style.display = 'block';
            const step1 = document.getElementById('step1');
            if (step1) {
                step1.style.display = 'block';
                const card = step1.querySelector('.glass-card');
                if (card) {
                    // Reset
                    card.style.opacity = 0;
                    card.style.transform = "scale(0.8) translateY(50px)"; // Start small & lower

                    // Animate In (Counter-motion to the dive)
                    gsap.to(card, {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power3.out"
                    });
                }
            }
            startCelebration();
        }, 800); // Trigger mid-dive
    };

    // Global Next Step
    window.nextStep = (stepNumber) => {
        const current = document.getElementById(`step${stepNumber - 1}`);
        const next = document.getElementById(`step${stepNumber}`);

        if (current) {
            current.classList.remove('animate-float-in');
            const card = current.querySelector('.glass-card') || current.querySelector('.envelope-container');
            if (card) card.classList.add('animate-exit');

            setTimeout(() => {
                current.style.display = 'none';
                if (next) {
                    next.style.display = 'block';
                    const nextCard = next.querySelector('.glass-card') || next.querySelector('.envelope-container');
                    if (nextCard) {
                        nextCard.classList.remove('animate-exit');
                        nextCard.classList.add('animate-float-in');
                    }
                }
            }, 600);
        }
    };

    openBtn.addEventListener('click', handleOpen);
    giftBox.addEventListener('click', handleOpen);

    // Envelope Logic
    if (envelope) {
        envelope.addEventListener('click', () => {
            if (!envelope.classList.contains('open')) {
                envelope.classList.add('open');
                setTimeout(() => {
                    const btn = document.getElementById('btnToAudio');
                    if (btn) {
                        btn.style.display = 'inline-block';
                        btn.style.opacity = 1;
                        gsap.from(btn, { y: 10, opacity: 0, duration: 0.4 });
                    }
                }, 800);
            }
        });
    }
});

function playMagicalSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        osc.start();
        osc.stop(ctx.currentTime + 1.0);
    } catch (e) { }
}

function startCelebration() {
    const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db'];
    for (let i = 0; i < 60; i++) {
        const div = document.createElement('div');
        div.className = 'confetti';
        div.style.position = 'fixed';
        div.style.width = '10px';
        div.style.height = '10px';
        div.style.left = '50%';
        div.style.top = '50%';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        div.style.zIndex = '9999';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 400 + 200;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        div.style.transition = 'transform 1.0s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1s ease-in';
        div.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg)`;

        document.body.appendChild(div);

        setTimeout(() => {
            div.style.opacity = 0;
            setTimeout(() => div.remove(), 1000);
        }, 100);
    }
}