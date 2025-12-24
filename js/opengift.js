// DOM Elements
const giftBox = document.getElementById('giftBox');
const openBtn = document.getElementById('openBtn');
const giftContent = document.getElementById('giftContent');
const envelopeWrapper = document.getElementById('envelopeWrapper');
const envelope = document.getElementById('envelope');
const letterContent = document.getElementById('letterContent');
const giftPhoto = document.getElementById('giftPhoto');
const photoMessage = document.getElementById('photoMessage');
const greeting = document.getElementById('greeting');
const voiceAudio = document.getElementById('voiceAudio');
const playVoiceBtn = document.getElementById('playVoiceBtn');
const bgMusic = document.getElementById('bgMusic');

// Step elements
let stepIndicator;
const contentSteps = [];
let currentStep = 0;
let hasGiftOpened = false;

// Gift Data
let giftData = {};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load gift data
    await loadGiftData();
    
    // Initialize elements
    initializeGift();
    
    // Create step indicator
    createStepIndicator();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check URL parameters for auto-open
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('preview') || urlParams.has('auto')) {
        setTimeout(openGift, 1000);
    }
    
    // Start background music (with user interaction)
    setupBackgroundMusic();
});

async function loadGiftData() {
    // Try to load from localStorage first
    const savedData = localStorage.getItem('christmasGift');
    
    if (savedData) {
        giftData = JSON.parse(savedData);
    } else {
        // If no saved data, use sample data
        giftData = {
            recipientName: "Friend",
            senderName: "Santa",
            message: "Merry Christmas! Wishing you joy and happiness this holiday season.",
            photo: "assets/images/photo.jpg",
            voiceMessage: null
        };
    }
}

function initializeGift() {
    // Update greeting
    greeting.textContent = `${giftData.recipientName}, click the gift box to open your present from ${giftData.senderName}!`;
    
    // Set photo if available
    if (giftData.photo) {
        giftPhoto.src = giftData.photo;
        giftPhoto.alt = `A special memory from ${giftData.senderName}`;
        giftPhoto.onerror = () => {
            giftPhoto.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop';
        };
    } else {
        // Hide photo step if no photo
        document.querySelector('.photo-memory').style.display = 'none';
    }
    
    // Set message
    photoMessage.textContent = giftData.message;
    
    // Format letter content PROPERLY - FIXED
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const letterHTML = `
        <p style="margin-bottom: 20px; font-weight: bold;">Dear ${giftData.recipientName},</p>
        
        <p style="margin-bottom: 15px; line-height: 1.6;">
            ${giftData.message}
        </p>
        
        <div style="margin-top: 40px; text-align: right;">
            <p style="margin-bottom: 5px;">With warmest wishes,</p>
            <p style="font-weight: bold; font-size: 1.3em; color: #c0392b;">${giftData.senderName}</p>
            <p style="font-size: 0.9em; color: #7f8c8d; margin-top: 10px; font-style: italic;">
                ${formattedDate}
            </p>
        </div>
    `;
    
    letterContent.innerHTML = letterHTML;
    
    // Set voice message if available
    if (giftData.voiceMessage) {
        voiceAudio.src = giftData.voiceMessage;
        voiceAudio.onerror = () => {
            console.log('Voice message could not be loaded');
            document.querySelector('.voice-message').innerHTML = `
                <h2><i class="fas fa-microphone-alt-slash"></i> Voice Message</h2>
                <div class="voice-icon">
                    <i class="fas fa-volume-mute"></i>
                </div>
                <p style="color: #666; font-style: italic;">
                    No voice message was included with this gift.
                </p>
                <p style="margin-top: 20px;">
                    <i class="fas fa-info-circle"></i> The sender chose not to include a voice message.
                </p>
            `;
        };
    } else {
        // Update voice message section if no voice
        document.querySelector('.voice-message').innerHTML = `
            <h2><i class="fas fa-microphone-alt-slash"></i> Voice Message</h2>
            <div class="voice-icon">
                <i class="fas fa-volume-mute"></i>
            </div>
            <p style="color: #666; font-style: italic;">
                No voice message was included with this gift.
            </p>
            <p style="margin-top: 20px;">
                <i class="fas fa-info-circle"></i> The sender chose not to include a voice message.
            </p>
        `;
    }
    
    // Collect content steps
    const photoMemory = document.querySelector('.photo-memory');
    const envelopeContainer = document.querySelector('.envelope-container');
    const voiceMessage = document.querySelector('.voice-message');
    
    if (photoMemory) contentSteps.push(photoMemory);
    if (envelopeContainer) contentSteps.push(envelopeContainer);
    if (voiceMessage) contentSteps.push(voiceMessage);
    
    // Hide all steps initially
    contentSteps.forEach(step => {
        step.classList.add('content-step');
        step.style.display = 'none';
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
    });
}

function createStepIndicator() {
    // Remove existing step indicator if any
    const existingIndicator = document.querySelector('.step-indicator');
    if (existingIndicator) existingIndicator.remove();
    
    stepIndicator = document.createElement('div');
    stepIndicator.className = 'step-indicator';
    stepIndicator.style.display = 'none';
    
    // Create steps based on available content
    const stepLabels = [];
    if (giftData.photo) stepLabels.push('Photo');
    stepLabels.push('Letter');
    if (giftData.voiceMessage) stepLabels.push('Voice');
    
    stepLabels.forEach((label, index) => {
        const step = document.createElement('div');
        step.className = 'step';
        step.textContent = index + 1;
        step.title = label;
        stepIndicator.appendChild(step);
    });
    
    // Insert after greeting
    greeting.parentNode.insertBefore(stepIndicator, greeting.nextSibling);
}

function setupEventListeners() {
    // Open gift box
    openBtn.addEventListener('click', openGift);
    giftBox.addEventListener('click', openGift);
    
    // Envelope interaction - FIXED
    if (envelopeWrapper) {
        envelopeWrapper.addEventListener('click', toggleEnvelope);
    }
    
    // Voice message play button
    if (playVoiceBtn && giftData.voiceMessage) {
        playVoiceBtn.addEventListener('click', () => {
            voiceAudio.play().catch(e => {
                console.log('Audio play failed:', e);
                // Show user-friendly message
                const originalHTML = playVoiceBtn.innerHTML;
                playVoiceBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Click to enable audio';
                playVoiceBtn.style.background = '#e67e22';
                
                playVoiceBtn.onclick = () => {
                    voiceAudio.play().then(() => {
                        playVoiceBtn.innerHTML = originalHTML;
                        playVoiceBtn.style.background = '';
                    }).catch(err => {
                        alert('Please interact with the page first (click anywhere) to enable audio playback.');
                    });
                };
            });
        });
    }
    
    // Add hover effects to gift box
    giftBox.addEventListener('mouseenter', () => {
        if (!giftBox.classList.contains('open')) {
            giftBox.style.transform = 'scale(1.1) rotateY(25deg)';
        }
    });
    
    giftBox.addEventListener('mouseleave', () => {
        if (!giftBox.classList.contains('open')) {
            giftBox.style.transform = 'scale(1) rotateY(15deg)';
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function setupBackgroundMusic() {
    const playMusic = () => {
        if (bgMusic && bgMusic.paused) {
            bgMusic.volume = 0.2;
            bgMusic.play().catch(e => {
                console.log('Background music play failed:', e);
            });
            
            // Remove event listeners after first play attempt
            document.removeEventListener('click', playMusic);
            document.removeEventListener('touchstart', playMusic);
            document.removeEventListener('keydown', playMusic);
        }
    };
    
    // Add multiple interaction listeners
    document.addEventListener('click', playMusic);
    document.addEventListener('touchstart', playMusic);
    document.addEventListener('keydown', playMusic);
    
    // Auto-play music for preview mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('preview')) {
        setTimeout(() => {
            if (bgMusic) {
                bgMusic.volume = 0.2;
                bgMusic.play().catch(e => console.log('Auto-play failed'));
            }
        }, 1000);
    }
}

function openGift() {
    if (hasGiftOpened) return;
    
    // Mark as opened
    hasGiftOpened = true;
    
    // Hide open button with animation
    openBtn.style.opacity = '0';
    openBtn.style.transform = 'scale(0.8)';
    setTimeout(() => {
        openBtn.style.display = 'none';
    }, 300);
    
    // Add opening class
    giftBox.classList.add('open');
    
    // Play opening sound
    playOpeningSound();
    
    // Show gift content after animation
    setTimeout(() => {
        giftContent.style.display = 'block';
        
        // Show step indicator
        stepIndicator.style.display = 'flex';
        
        // Show first step
        setTimeout(() => {
            showStep(0);
        }, 300);
        
        // Add celebration effects
        celebrateOpening();
        
    }, 1200);
}

function showStep(stepIndex) {
    // Update step indicator
    const steps = stepIndicator.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === stepIndex) {
            step.classList.add('active');
        } else if (index < stepIndex) {
            step.classList.add('completed');
        }
    });
    
    // Hide all steps
    contentSteps.forEach((step, index) => {
        step.style.display = 'none';
        step.classList.remove('active', 'completed');
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
    });
    
    // Show current step
    if (contentSteps[stepIndex]) {
        contentSteps[stepIndex].style.display = 'block';
        
        // Animate in
        setTimeout(() => {
            contentSteps[stepIndex].style.opacity = '1';
            contentSteps[stepIndex].style.transform = 'translateY(0)';
            contentSteps[stepIndex].classList.add('active');
        }, 50);
        
        // Add next button if not last step
        if (stepIndex < contentSteps.length - 1) {
            addNextButton(stepIndex);
        } else {
            // Last step - show completion
            setTimeout(() => {
                showCompletionMessage();
            }, 1000);
        }
    } else {
        // No more steps
        showCompletionMessage();
    }
    
    currentStep = stepIndex;
}

function addNextButton(stepIndex) {
    // Remove existing next button
    const existingButton = document.querySelector('.next-button');
    if (existingButton) existingButton.remove();
    
    // Create next button
    const nextButton = document.createElement('button');
    nextButton.className = 'btn-primary next-button';
    nextButton.innerHTML = `<i class="fas fa-arrow-right"></i> Continue to Next`;
    nextButton.style.cssText = `
        margin: 30px auto;
        display: block;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
    `;
    
    // Add event listener
    nextButton.addEventListener('click', () => {
        // Complete current step
        contentSteps[stepIndex].classList.add('completed');
        contentSteps[stepIndex].classList.remove('active');
        
        // Animate out current step
        contentSteps[stepIndex].style.opacity = '0';
        contentSteps[stepIndex].style.transform = 'translateY(-20px)';
        
        // Show next step after delay
        setTimeout(() => {
            showStep(stepIndex + 1);
        }, 500);
    });
    
    // Add button to current step
    contentSteps[stepIndex].appendChild(nextButton);
    
    // Show button with animation after a delay
    setTimeout(() => {
        nextButton.style.opacity = '1';
        nextButton.style.transform = 'translateY(0)';
        nextButton.classList.add('show');
    }, 1000);
}

function showCompletionMessage() {
    const completionMessage = document.createElement('div');
    completionMessage.className = 'completion-message';
    completionMessage.innerHTML = `
        <h2><i class="fas fa-star"></i> Gift Unwrapped! <i class="fas fa-star"></i></h2>
        <div style="font-size: 4rem; margin: 20px 0; color: #f1c40f;">🎁✨</div>
        <p style="font-size: 1.3rem; margin: 20px 0; line-height: 1.6;">
            Your virtual Christmas gift from <strong>${giftData.senderName}</strong> has been fully revealed!
        </p>
        <p style="margin: 25px 0; font-style: italic; color: #ecf0f1;">
            "May your holidays be filled with joy, love, and cherished moments."
        </p>
        <p style="margin: 20px 0; font-size: 1.1rem;">
            Wishing you a very Merry Christmas and a Happy New Year! 🎄⛄
        </p>
        <div style="margin-top: 30px;">
            <button id="replayGiftBtn" class="btn-secondary" style="margin-right: 10px;">
                <i class="fas fa-redo"></i> Replay Gift
            </button>
            <button id="shareGiftBtn" class="btn-primary">
                <i class="fas fa-share-alt"></i> Share This Gift
            </button>
        </div>
    `;
    
    giftContent.appendChild(completionMessage);
    
    // Show with animation
    setTimeout(() => {
        completionMessage.classList.add('show');
    }, 300);
    
    // Add functionality to buttons
    document.getElementById('replayGiftBtn').addEventListener('click', replayGift);
    document.getElementById('shareGiftBtn').addEventListener('click', shareGift);
}

function toggleEnvelope() {
    if (!envelope) return;
    
    const isOpen = envelope.classList.contains('open');
    
    if (!isOpen) {
        // Open envelope
        envelope.classList.add('open');
        playPaperSound();
        
        // Show letter content after a slight delay
        setTimeout(() => {
            if (letterContent) {
                letterContent.style.opacity = '1';
                letterContent.style.transform = 'translateY(0)';
            }
        }, 400);
    } else {
        // Close envelope
        envelope.classList.remove('open');
        playPaperSound();
        
        // Hide letter content
        if (letterContent) {
            letterContent.style.opacity = '0';
            letterContent.style.transform = 'translateY(10px)';
        }
    }
}

function playOpeningSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create multiple oscillators for richer sound
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Set frequencies for a Christmas chord
        osc1.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
        osc2.frequency.setValueAtTime(493.88, audioContext.currentTime); // B4
        
        // Create envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
        
        osc1.start(audioContext.currentTime);
        osc2.start(audioContext.currentTime);
        osc1.stop(audioContext.currentTime + 1.2);
        osc2.stop(audioContext.currentTime + 1.2);
        
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playPaperSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 0.3;
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Create paper rustle sound
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        noise.buffer = buffer;
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        noise.start(audioContext.currentTime);
        noise.stop(audioContext.currentTime + duration);
        
    } catch (e) {
        console.log('Paper sound failed');
    }
}

function celebrateOpening() {
    // Add more snowflakes
    addExtraSnowflakes();
    
    // Add confetti
    createConfettiEffect();
    
    // Update greeting
    greeting.innerHTML = `<i class="fas fa-gift"></i> Unwrapping Your Gift... <i class="fas fa-gift"></i>`;
    greeting.classList.add('animate-pulse');
    
    // Add sparkles around gift box
    addSparklesAroundGift();
}

function addExtraSnowflakes() {
    const snowflakesContainer = document.querySelector('.snowflakes');
    if (!snowflakesContainer) return;
    
    const extraFlakes = 50;
    
    for (let i = 0; i < extraFlakes; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Random properties
        const size = Math.random() * 12 + 6;
        const left = Math.random() * 100;
        const opacity = Math.random() * 0.7 + 0.3;
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 10;
        
        snowflake.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}vw;
            opacity: ${opacity};
            background: white;
            border-radius: 50%;
            position: fixed;
            top: -30px;
            pointer-events: none;
            z-index: 1;
            filter: blur(${Math.random() * 2}px);
            animation: snowfall ${duration}s linear ${delay}s infinite;
        `;
        
        snowflakesContainer.appendChild(snowflake);
    }
}

function createConfettiEffect() {
    const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db', '#9b59b6', '#1abc9c'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        
        confetti.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}vw;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            transform: rotate(${Math.random() * 360}deg);
            pointer-events: none;
            z-index: 999;
            animation: confettiFall ${animationDuration}s ease-out forwards;
        `;
        
        document.body.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, animationDuration * 1000);
    }
}

function addSparklesAroundGift() {
    const giftRect = giftBox.getBoundingClientRect();
    const giftCenterX = giftRect.left + giftRect.width / 2;
    const giftCenterY = giftRect.top + giftRect.height / 2;
    
    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        const angle = (i / 15) * Math.PI * 2;
        const distance = 100 + Math.random() * 50;
        const x = giftCenterX + Math.cos(angle) * distance;
        const y = giftCenterY + Math.sin(angle) * distance;
        
        sparkle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: #f1c40f;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            box-shadow: 0 0 15px #f1c40f;
            pointer-events: none;
            z-index: 100;
            animation: sparkle 1.5s ease-in-out infinite;
            animation-delay: ${i * 0.1}s;
        `;
        
        document.body.appendChild(sparkle);
        
        // Remove after some time
        setTimeout(() => {
            sparkle.remove();
        }, 3000);
    }
}

function shareGift() {
    const shareData = {
        title: `🎁 A Virtual Christmas Gift from ${giftData.senderName}`,
        text: `${giftData.recipientName}, you've received a beautiful virtual Christmas gift! Click to open your surprise.`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                // Show success message
                const shareBtn = document.getElementById('shareGiftBtn');
                const originalHTML = shareBtn.innerHTML;
                shareBtn.innerHTML = '<i class="fas fa-check"></i> Shared!';
                shareBtn.style.background = '#27ae60';
                
                setTimeout(() => {
                    shareBtn.innerHTML = originalHTML;
                    shareBtn.style.background = '';
                }, 2000);
            })
            .catch(error => {
                console.log('Error sharing:', error);
                copyToClipboard(shareData.url);
            });
    } else {
        copyToClipboard(shareData.url);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('🎄 Gift link copied to clipboard! Share it with the recipient.');
        })
        .catch(() => {
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('🎄 Gift link copied to clipboard! Share it with the recipient.');
        });
}

function replayGift() {
    // Reset all steps
    contentSteps.forEach(step => {
        step.style.display = 'none';
        step.classList.remove('active', 'completed');
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
    });
    
    // Reset step indicator
    const steps = stepIndicator.querySelectorAll('.step');
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    // Reset gift box
    giftBox.classList.remove('open');
    giftBox.style.transform = 'scale(1) rotateY(15deg)';
    
    // Reset envelope if open
    if (envelope && envelope.classList.contains('open')) {
        envelope.classList.remove('open');
    }
    
    // Show open button again
    openBtn.style.display = 'block';
    openBtn.style.opacity = '1';
    openBtn.style.transform = 'scale(1)';
    
    // Hide completion message
    const completionMessage = document.querySelector('.completion-message');
    if (completionMessage) {
        completionMessage.remove();
    }
    
    // Reset state
    hasGiftOpened = false;
    currentStep = 0;
    
    // Reset greeting
    greeting.textContent = `${giftData.recipientName}, click the gift box to open your present from ${giftData.senderName}!`;
    greeting.classList.remove('animate-pulse');
}

function handleKeyboardShortcuts(e) {
    switch(e.key) {
        case 'Escape':
            // Close envelope if open
            if (envelope && envelope.classList.contains('open')) {
                toggleEnvelope();
            }
            break;
            
        case ' ':
        case 'ArrowRight':
            // Space or right arrow to go to next step
            if (hasGiftOpened && currentStep < contentSteps.length - 1) {
                e.preventDefault();
                const nextButton = document.querySelector('.next-button');
                if (nextButton) nextButton.click();
            }
            break;
            
        case 'ArrowLeft':
            // Left arrow to go to previous step
            if (hasGiftOpened && currentStep > 0) {
                e.preventDefault();
                showStep(currentStep - 1);
            }
            break;
            
        case 'm':
        case 'M':
            // M to toggle music
            if (bgMusic) {
                e.preventDefault();
                if (bgMusic.paused) {
                    bgMusic.play();
                } else {
                    bgMusic.pause();
                }
            }
            break;
            
        case 'r':
        case 'R':
            // R to replay gift
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                replayGift();
            }
            break;
    }
}

// Add confetti animation if not exists
if (!document.querySelector('#confetti-animation')) {
    const style = document.createElement('style');
    style.id = 'confetti-animation';
    style.textContent = `
        @keyframes confettiFall {
            0% {
                opacity: 1;
                transform: translateY(0) rotate(0deg);
            }
            100% {
                opacity: 0;
                transform: translateY(100vh) rotate(360deg);
            }
        }
        
        @keyframes sparkle {
            0%, 100% { 
                opacity: 0; 
                transform: scale(0.5) rotate(0deg); 
            }
            50% { 
                opacity: 1; 
                transform: scale(1.2) rotate(180deg); 
            }
        }
        
        @keyframes snowfall {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
            }
            100% {
                transform: translateY(100vh) translateX(${Math.random() > 0.5 ? '100px' : '-100px'}) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}