import { db } from './database.js';

let mediaRecorder;
let audioChunks = [];

// Globals to store state for other scripts
window.currentVoiceUrl = null;

document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const audioPreview = document.getElementById('audioPreview');

    if (!recordBtn || !stopBtn) return;

    recordBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPreview.src = audioUrl;
                audioPreview.style.display = 'block';

                // Automatically upload just to have the URL ready? 
                // Or upload on "Create"? 
                // Let's upload immediately for simplicity in this flow, or store blob for later.
                // Better: Upload immediately to get URL.

                recordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                try {
                    const filename = `voice/${Date.now()}_msg.webm`;
                    const publicUrl = await db.uploadFile(audioBlob, filename);
                    window.currentVoiceUrl = publicUrl;

                    recordBtn.innerHTML = '<i class="fas fa-check"></i> Recorded!';
                    recordBtn.disabled = false;
                } catch (err) {
                    console.error("Upload voice error", err);
                    recordBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
                }
            };

            mediaRecorder.start();
            recordBtn.disabled = true;
            recordBtn.innerHTML = '<i class="fas fa-circle" style="color:red"></i> Recording...';
            stopBtn.disabled = false;

        } catch (err) {
            console.error("Mic access error:", err);
            alert("Microphone access denied or not available.");
        }
    });

    stopBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            stopBtn.disabled = true;
            // Stop all tracks
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    });
});