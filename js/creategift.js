import { db } from './database.js';
import { VoiceRecorder } from './voice.js';

// DOM Elements
const form = document.getElementById('create-gift-form');
const recordBtn = document.getElementById('record-btn');
const stopBtn = document.getElementById('stop-btn');
const playBtn = document.getElementById('play-btn');
const recordStatus = document.getElementById('record-status');
const createBtn = document.getElementById('create-btn');
const resultArea = document.getElementById('result-area');
const shareLinkDisplay = document.getElementById('share-link');
const copyBtn = document.getElementById('copy-btn');
const previewLink = document.getElementById('preview-link');

// State
let voiceBlob = null;
const recorder = new VoiceRecorder();

/**
 * Voice Recording Handlers
 */
recordBtn.addEventListener('click', async () => {
    try {
        await recorder.start();
        recordBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        playBtn.style.display = 'none';
        recordStatus.textContent = 'Recording...';
        recordStatus.style.color = 'var(--color-accent)';
    } catch (err) {
        console.error(err);
        alert('Could not access microphone.');
    }
});

stopBtn.addEventListener('click', async () => {
    voiceBlob = await recorder.stop();
    recordBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    playBtn.style.display = 'block';
    recordStatus.textContent = 'Recording saved!';
    recordStatus.style.color = 'white';
    recordBtn.textContent = '🎙️ Re-record';
});

playBtn.addEventListener('click', () => {
    recorder.playPreview();
});

/**
 * Form Submission
 */
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI Loading State
    createBtn.disabled = true;
    createBtn.textContent = 'Wrapping Gift... 🎁';
    createBtn.style.opacity = '0.7';

    try {
        const sender = document.getElementById('sender').value;
        const receiver = document.getElementById('receiver').value;
        const message = document.getElementById('message').value;
        const photoFile = document.getElementById('photo-upload').files[0];

        // 1. Upload Assets if they exist
        let voiceUrl = null;
        let photoUrl = null;

        // Generate a temporary ID or use a predictable path structure. 
        // Better: let's use a timestamp + random string for path to avoid needing DB ID first.
        const timestamp = Date.now();

        if (voiceBlob) {
            const path = `${timestamp}_voice.webm`;
            voiceUrl = await db.uploadFile(voiceBlob, path);
        }

        if (photoFile) {
            const path = `${timestamp}_${photoFile.name}`;
            photoUrl = await db.uploadFile(photoFile, path);
        }

        // 2. Create Gift Record
        const gift = await db.createGift({
            senderName: sender,
            receiverName: receiver,
            message: message,
            voiceUrl: voiceUrl
            // music: 'default' // TODO: Add music selection later
        });

        // 3. Link Photo if exists
        if (photoUrl) {
            await db.addPhotos(gift.id, [photoUrl]);
        }

        // 4. Success! Show Result
        const url = `${window.location.origin}/open.html?giftId=${gift.id}`;

        form.style.display = 'none';
        resultArea.style.display = 'block';
        shareLinkDisplay.textContent = url;
        previewLink.href = url;

    } catch (err) {
        console.error('Error creating gift:', err);
        // Show specific error to help user debug (likely missing table or bucket)
        alert(`Error: ${err.message || err.error_description || JSON.stringify(err)}`);

        createBtn.disabled = false;
        createBtn.textContent = '🎁 Create Magic Link';
        createBtn.style.opacity = '1';
    }
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(shareLinkDisplay.textContent);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy Link', 2000);
});