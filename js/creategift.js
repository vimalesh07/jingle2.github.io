// DOM Elements
const createGiftBtn = document.getElementById('createGiftBtn');
const previewBtn = document.getElementById('previewBtn');
const successModal = document.getElementById('successModal');
const closeModal = document.querySelector('.close-modal');
const openGiftBtn = document.getElementById('openGiftBtn');
const copyLinkBtn = document.getElementById('copyLink');
const giftLinkInput = document.getElementById('giftLink');

// Gift Data
let giftData = {
    recipientName: '',
    senderName: '',
    message: '',
    photo: null,
    voiceMessage: null,
    createdAt: new Date().toISOString()
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data if exists
    const savedData = localStorage.getItem('christmasGift');
    if (savedData) {
        giftData = JSON.parse(savedData);
        populateForm();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Add some interactive elements to the preview
    addPreviewInteractivity();
});

function setupEventListeners() {
    // Form inputs
    document.getElementById('recipientName').addEventListener('input', (e) => {
        giftData.recipientName = e.target.value;
        saveToLocalStorage();
    });
    
    document.getElementById('senderName').addEventListener('input', (e) => {
        giftData.senderName = e.target.value;
        saveToLocalStorage();
    });
    
    document.getElementById('message').addEventListener('input', (e) => {
        giftData.message = e.target.value;
        saveToLocalStorage();
    });
    
    // Photo upload
    document.getElementById('photo').addEventListener('change', handlePhotoUpload);
    
    // Create Gift Button
    createGiftBtn.addEventListener('click', createGift);
    
    // Preview Button
    previewBtn.addEventListener('click', previewGift);
    
    // Modal controls
    closeModal.addEventListener('click', () => {
        successModal.style.display = 'none';
    });
    
    openGiftBtn.addEventListener('click', () => {
        window.location.href = 'open.html';
    });
    
    copyLinkBtn.addEventListener('click', copyGiftLink);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            giftData.photo = event.target.result;
            saveToLocalStorage();
            
            // Show preview in the gift box
            const previewBox = document.querySelector('.gift-box .top');
            previewBox.style.backgroundImage = `url(${event.target.result})`;
            previewBox.style.backgroundSize = 'cover';
            previewBox.style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(file);
    }
}

function populateForm() {
    document.getElementById('recipientName').value = giftData.recipientName;
    document.getElementById('senderName').value = giftData.senderName;
    document.getElementById('message').value = giftData.message;
    
    if (giftData.photo) {
        const previewBox = document.querySelector('.gift-box .top');
        previewBox.style.backgroundImage = `url(${giftData.photo})`;
        previewBox.style.backgroundSize = 'cover';
        previewBox.style.backgroundPosition = 'center';
    }
}

function saveToLocalStorage() {
    localStorage.setItem('christmasGift', JSON.stringify(giftData));
}

function validateForm() {
    if (!giftData.recipientName.trim()) {
        alert('Please enter recipient\'s name');
        return false;
    }
    
    if (!giftData.senderName.trim()) {
        alert('Please enter your name');
        return false;
    }
    
    if (!giftData.message.trim()) {
        alert('Please write a message');
        return false;
    }
    
    return true;
}

function createGift() {
    if (!validateForm()) return;
    
    // Show loading state
    const originalText = createGiftBtn.innerHTML;
    createGiftBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    createGiftBtn.disabled = true;
    
    // Simulate processing delay
    setTimeout(() => {
        // Generate unique gift ID
        const giftId = 'gift_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        giftData.id = giftId;
        
        // Save complete data
        saveToLocalStorage();
        
        // Generate shareable link
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = baseUrl.replace('index.html', 'open.html') + '?id=' + giftId;
        
        // Update modal content
        giftLinkInput.value = shareUrl;
        
        // Show success modal
        successModal.style.display = 'flex';
        
        // Reset button
        createGiftBtn.innerHTML = originalText;
        createGiftBtn.disabled = false;
        
        // Add celebration effect
        celebrateCreation();
        
    }, 1500);
}

function previewGift() {
    if (!validateForm()) return;
    
    // Save data and redirect
    saveToLocalStorage();
    window.open('open.html?preview=true', '_blank');
}

function copyGiftLink() {
    giftLinkInput.select();
    giftLinkInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            // Show feedback
            const originalText = copyLinkBtn.innerHTML;
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyLinkBtn.style.background = 'var(--primary-green)';
            copyLinkBtn.style.color = 'white';
            
            setTimeout(() => {
                copyLinkBtn.innerHTML = originalText;
                copyLinkBtn.style.background = '';
                copyLinkBtn.style.color = '';
            }, 2000);
        }
    } catch (err) {
        // Fallback for browsers that don't support execCommand
        navigator.clipboard.writeText(giftLinkInput.value)
            .then(() => {
                const originalText = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyLinkBtn.style.background = 'var(--primary-green)';
                copyLinkBtn.style.color = 'white';
                
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalText;
                    copyLinkBtn.style.background = '';
                    copyLinkBtn.style.color = '';
                }, 2000);
            })
            .catch(err => {
                alert('Failed to copy link. Please copy it manually.');
            });
    }
}

function addPreviewInteractivity() {
    const giftBox = document.querySelector('.gift-box');
    
    giftBox.addEventListener('mouseenter', () => {
        giftBox.style.transform = 'scale(1.05) rotateY(10deg)';
    });
    
    giftBox.addEventListener('mouseleave', () => {
        giftBox.style.transform = 'scale(1) rotateY(0deg)';
    });
    
    giftBox.addEventListener('click', () => {
        giftBox.classList.add('animate-pulse');
        setTimeout(() => {
            giftBox.classList.remove('animate-pulse');
        }, 1000);
    });
}

function celebrateCreation() {
    // Add confetti effect
    const colors = ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db', '#9b59b6'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.borderRadius = '50%';
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
    
    // Play success sound if available
    playSuccessSound();
}

function playSuccessSound() {
    // Create a simple success sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Export gift data for other scripts
window.getGiftData = () => giftData;