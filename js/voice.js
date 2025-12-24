// Voice Recording and Playback
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// DOM Elements
const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const audioPreview = document.getElementById('audioPreview');

// Check for browser support
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    initializeVoiceRecording();
} else {
    disableVoiceRecording();
}

function initializeVoiceRecording() {
    recordBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    
    // Update UI
    recordBtn.disabled = false;
    recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Message';
}

function disableVoiceRecording() {
    recordBtn.disabled = true;
    recordBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Voice Not Supported';
    document.querySelector('.voice-controls').style.opacity = '0.5';
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Update preview
            audioPreview.src = audioUrl;
            audioPreview.style.display = 'block';
            
            // Save to gift data
            const giftData = window.getGiftData ? window.getGiftData() : {};
            giftData.voiceMessage = audioUrl;
            
            // Save to localStorage
            localStorage.setItem('christmasGift', JSON.stringify(giftData));
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        recordBtn.innerHTML = '<i class="fas fa-circle"></i> Recording...';
        recordBtn.style.background = 'var(--primary-red)';
        recordBtn.style.color = 'white';
        
        // Visual feedback
        addRecordingAnimation();
        
    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Update UI
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Again';
        recordBtn.style.background = '';
        recordBtn.style.color = '';
        
        // Remove recording animation
        removeRecordingAnimation();
    }
}

function addRecordingAnimation() {
    // Add pulsing animation to record button
    recordBtn.classList.add('animate-pulse');
    
    // Create visualizer
    const visualizer = document.createElement('div');
    visualizer.id = 'voiceVisualizer';
    visualizer.style.position = 'absolute';
    visualizer.style.top = '0';
    visualizer.style.left = '0';
    visualizer.style.width = '100%';
    visualizer.style.height = '100%';
    visualizer.style.borderRadius = '8px';
    visualizer.style.background = 'rgba(231, 76, 60, 0.1)';
    visualizer.style.animation = 'pulse 1s infinite';
    visualizer.style.pointerEvents = 'none';
    visualizer.style.zIndex = '-1';
    
    recordBtn.style.position = 'relative';
    recordBtn.appendChild(visualizer);
}

function removeRecordingAnimation() {
    recordBtn.classList.remove('animate-pulse');
    const visualizer = document.getElementById('voiceVisualizer');
    if (visualizer) {
        visualizer.remove();
    }
}

// Audio playback enhancement
function enhanceAudioPlayback() {
    const audioElements = document.querySelectorAll('audio');
    
    audioElements.forEach(audio => {
        // Add custom controls if needed
        audio.addEventListener('play', () => {
            audio.parentElement.classList.add('playing');
        });
        
        audio.addEventListener('pause', () => {
            audio.parentElement.classList.remove('playing');
        });
        
        audio.addEventListener('ended', () => {
            audio.parentElement.classList.remove('playing');
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', enhanceAudioPlayback);

// Export functions for use in other scripts
window.VoiceRecorder = {
    startRecording,
    stopRecording,
    isRecording: () => isRecording
};