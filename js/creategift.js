import { db } from './database.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const createBtn = document.getElementById('createGiftBtn');
    const previewBtn = document.getElementById('previewBtn');
    const previewBox = document.getElementById('previewBox');
    const photoInput = document.getElementById('photo');
    const successModal = document.getElementById('successModal');
    const closeModal = document.querySelector('.close-modal');
    const giftLinkInput = document.getElementById('giftLink');
    const copyLinkBtn = document.getElementById('copyLink');
    const openGiftBtn = document.getElementById('openGiftBtn');

    let giftPhotoUrl = null;

    // --- 1. 3D Preview Interactivity ---
    // Simple rotation on mouse move for "Live" feel
    const container = document.querySelector('.gift-preview');
    if (container) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation based on cursor position
            const rotateX = -20 + (y / rect.height - 0.5) * 30; // -20deg base tilt
            const rotateY = 45 + (x / rect.width - 0.5) * 60; // 45deg base rotation

            if (previewBox) {
                previewBox.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });

        // Reset on mouse leave
        container.addEventListener('mouseleave', () => {
            if (previewBox) {
                previewBox.style.transform = `rotateX(-20deg) rotateY(45deg)`;
            }
        });
    }

    // --- 2. Photo Upload Handling ---
    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Visual feedback
        const originalLabel = photoInput.previousElementSibling.innerHTML;
        photoInput.previousElementSibling.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

        try {
            // Upload to Supabase Storage
            const path = `photos/${Date.now()}_${file.name}`;
            giftPhotoUrl = await db.uploadFile(file, path);

            // Show success
            photoInput.previousElementSibling.innerHTML = '<i class="fas fa-check"></i> Photo Added!';

            // Note: In a real advanced app, we might map this texture to the box wrapper!
            // For now, we just store it.
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload photo. Please try again.');
            photoInput.previousElementSibling.innerHTML = originalLabel;
        }
    });

    // --- 3. Form Submission ---
    createBtn.addEventListener('click', async () => {
        // Validation
        const recipient = document.getElementById('recipientName').value.trim();
        const sender = document.getElementById('senderName').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!recipient || !sender || !message) {
            alert('Please fill in all required fields (Recipient, Name, Message).');
            return;
        }

        // Loading state
        const originalText = createBtn.innerHTML;
        createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        createBtn.disabled = true;

        try {
            // Get voice URL if recorded (assuming voice.js exposes this)
            const voiceUrl = window.currentVoiceUrl || null;

            // Create Gift in DB
            const newGift = await db.createGift({
                senderName: sender,
                receiverName: recipient,
                message: message,
                voiceUrl: voiceUrl
            });

            // If photo exists, add it (using the separate table logic from db.js)
            if (giftPhotoUrl) {
                await db.addPhotos(newGift.id, [giftPhotoUrl]);
            }

            // Success! Generate Link
            const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
            const shareUrl = `${baseUrl}/open.html?id=${newGift.id}`;

            giftLinkInput.value = shareUrl;
            successModal.style.display = 'block';

            // Confetti Effect
            createConfetti();

        } catch (error) {
            console.error('Creation error:', error);
            alert('Something went wrong creating your gift. Please try again.');
        } finally {
            createBtn.innerHTML = originalText;
            createBtn.disabled = false;
        }
    });

    // --- 4. Modal Actions ---
    closeModal.addEventListener('click', () => successModal.style.display = 'none');

    copyLinkBtn.addEventListener('click', () => {
        giftLinkInput.select();
        document.execCommand('copy'); // Fallback
        navigator.clipboard.writeText(giftLinkInput.value).then(() => {
            const original = copyLinkBtn.innerHTML;
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => copyLinkBtn.innerHTML = original, 2000);
        });
    });

    openGiftBtn.addEventListener('click', () => {
        window.location.href = giftLinkInput.value;
    });

    // --- 5. Preview Mode ---
    previewBtn.addEventListener('click', () => {
        // Just opens the open page with dummy data or special flag
        const url = 'open.html?preview=true';
        window.open(url, '_blank');
    });
});

// Helper for confetti
function createConfetti() {
    const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db'];
    for (let i = 0; i < 50; i++) {
        const div = document.createElement('div');
        div.className = 'confetti';
        div.style.left = Math.random() * 100 + 'vw';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        div.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }
}