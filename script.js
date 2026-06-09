/**
 * Hello Kitty Landing Page - Interactive Script
 * Features: Sparkle Trail Cursor, Bow Customizer, Local Audio Synthesizer, Treats Carousel, Lightbox, Form Validation
 */

// --- GLOBAL VARIABLES & STATE ---
let isPlaying = false;
let rainbowInterval = null;

// --- 1. YOUTUBE IFRAME CONTROL VIA POSTMESSAGE ---
// Sends one-way postMessage commands to control playback/volume of the hidden iframe
function sendYoutubeCommand(func, args = []) {
    const iframe = document.getElementById('youtube-audio-iframe');
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: func,
            args: args
        }), '*');
    }
}

// Timeline State Variables
const songDuration = 222; // 3 minutes and 42 seconds (in seconds)
let currentTime = 0;
let progressInterval = null;
let isSeeking = false; // to prevent timeline jumping while dragging

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startMusic() {
    isPlaying = true;
    sendYoutubeCommand('playVideo');
    
    // Rotate wheels
    document.getElementById('wheel-left').classList.add('spinning');
    document.getElementById('wheel-right').classList.add('spinning');
    document.getElementById('play-icon').className = 'fa-solid fa-pause';
    
    // Start timeline timer
    startTimeline();
}

function stopMusic() {
    isPlaying = false;
    sendYoutubeCommand('pauseVideo');
    
    // Stop wheels
    document.getElementById('wheel-left').classList.remove('spinning');
    document.getElementById('wheel-right').classList.remove('spinning');
    document.getElementById('play-icon').className = 'fa-solid fa-play';
    
    // Pause timeline timer
    stopTimeline();
}

function startTimeline() {
    stopTimeline(); // clear existing if any
    progressInterval = setInterval(() => {
        if (!isSeeking) {
            currentTime++;
            if (currentTime >= songDuration) {
                currentTime = 0; // reset on loop
            }
            updateTimelineUI();
        }
    }, 1000);
}

function stopTimeline() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateTimelineUI() {
    const progressSlider = document.getElementById('progress-slider');
    const currentTimeText = document.getElementById('current-time');
    
    if (progressSlider) {
        progressSlider.value = (currentTime / songDuration) * 100;
    }
    if (currentTimeText) {
        currentTimeText.textContent = formatTime(currentTime);
    }
}

// Initializing page music controls after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    const muteIcon = document.getElementById('mute-icon');
    const progressSlider = document.getElementById('progress-slider');
    const enterBtn = document.getElementById('enter-btn');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    let isMuted = false;

    // Welcome screen enter button click
    if (enterBtn && welcomeOverlay) {
        enterBtn.addEventListener('click', () => {
            // Trigger actual audio play (allowed by browser now that user interacted!)
            startMusic();
            
            // Hide welcome overlay with fade-out transition
            welcomeOverlay.classList.add('fade-out');
            
            // Play cute click synth chime
            playCuteSound();
            
            // Spawn a burst of celebration sparkles in the center!
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            for (let i = 0; i < 40; i++) {
                particles.push(new SparkleParticle(centerX + (Math.random() - 0.5) * 200, centerY + (Math.random() - 0.5) * 100));
            }
        });
    }

    // Cassette play/pause click
    playPauseBtn.addEventListener('click', () => {
        if (!isPlaying) {
            startMusic();
        } else {
            stopMusic();
        }
    });

    // Mute/Unmute toggle click
    if (muteBtn && muteIcon) {
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                sendYoutubeCommand('mute');
                muteIcon.className = 'fa-solid fa-volume-xmark';
                muteBtn.setAttribute('title', 'Bật âm thanh');
            } else {
                sendYoutubeCommand('unMute');
                muteIcon.className = 'fa-solid fa-volume-high';
                muteBtn.setAttribute('title', 'Tắt âm thanh');
            }
            playCuteSound();
        });
    }
    
    // Dragging progress slider (seeking)
    if (progressSlider) {
        progressSlider.addEventListener('input', () => {
            isSeeking = true;
            const sliderVal = parseInt(progressSlider.value);
            const displayTime = Math.round((sliderVal / 100) * songDuration);
            document.getElementById('current-time').textContent = formatTime(displayTime);
        });

        progressSlider.addEventListener('change', () => {
            const sliderVal = parseInt(progressSlider.value);
            currentTime = Math.round((sliderVal / 100) * songDuration);
            updateTimelineUI();
            
            // Tell YouTube to seek to new time
            sendYoutubeCommand('seekTo', [currentTime, true]);
            
            isSeeking = false;
        });
    }
    
    // Set initial volume when iframe loads
    const iframe = document.getElementById('youtube-audio-iframe');
    if (iframe) {
        iframe.addEventListener('load', () => {
            sendYoutubeCommand('setVolume', [50]); // set default volume to 50%
            sendYoutubeCommand('unMute');
        });
    }
});

// --- 2. SPARKLE CURSOR TRAIL EFFECT ---
const canvas = document.getElementById('sparkle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

// Resize canvas to cover window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle Class
class SparkleParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // Random velocity
        this.vx = (Math.random() - 0.5) * 2.5;
        this.vy = (Math.random() - 0.5) * 2.5 - 1; // Slight float up
        this.size = Math.random() * 8 + 3;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        // Pink pastel color palette
        const colors = ['#FFB7C5', '#FF85A2', '#FF4B72', '#FFE5EC', '#FFFFFF', '#FFE66D'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.spin = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        this.angle += this.spin;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;

        // Draw star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(0, 0 - this.size);
            ctx.rotate(Math.PI / 5);
            ctx.lineTo(0, 0 - this.size / 2.5);
            ctx.rotate(Math.PI / 5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// Track mouse position
window.addEventListener('mousemove', (e) => {
    // Generate particles on mouse movement
    for (let i = 0; i < 2; i++) {
        particles.push(new SparkleParticle(e.clientX, e.clientY));
    }
});

// Touch support for mobile
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        for (let i = 0; i < 2; i++) {
            particles.push(new SparkleParticle(e.touches[0].clientX, e.touches[0].clientY));
        }
    }
});

// Sparkle animation loop
function animateSparkles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        } else {
            particles[i].draw();
        }
    }
    requestAnimationFrame(animateSparkles);
}
animateSparkles();

// --- 3. BOW COLOR CUSTOMIZER ---
const bowBtns = document.querySelectorAll('.bow-btn');
const bowFills = document.querySelectorAll('.bow-fill');
const currentBowName = document.getElementById('current-bow-name');
const avatarContainer = document.querySelector('.kitty-avatar-container');

bowBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        bowBtns.forEach(b => {
            b.classList.remove('active');
            b.classList.remove('rainbow-active');
        });

        // Add active class to clicked button
        btn.classList.add('active');

        // Clear existing rainbow animation if active
        clearInterval(rainbowInterval);
        rainbowInterval = null;

        const color = btn.getAttribute('data-color');
        const title = btn.getAttribute('title');

        // Trigger pop animation on Hello Kitty head
        avatarContainer.classList.add('pop-anim');
        setTimeout(() => {
            avatarContainer.classList.remove('pop-anim');
        }, 500);

        if (color === 'sparkle') {
            btn.classList.add('rainbow-active');
            currentBowName.textContent = 'Phép Thuật Lấp Lánh';
            // Start cycling colors (rainbow effect)
            let hue = 0;
            rainbowInterval = setInterval(() => {
                hue = (hue + 12) % 360;
                bowFills.forEach(fill => {
                    fill.style.fill = `hsl(${hue}, 90%, 65%)`;
                });
                // Spawn sparkles at the bow location
                spawnBowSparkles();
            }, 80);
        } else {
            // Apply standard color
            bowFills.forEach(fill => {
                fill.style.fill = color;
            });
            currentBowName.textContent = title;
        }

        // Cute sound effect (meow/pop simulation via Web Audio API)
        playCuteSound();
    });
});

// Helper to spawn sparkles around Kitty's bow inside the avatar
function spawnBowSparkles() {
    const avatarRect = avatarContainer.getBoundingClientRect();
    // Approximate coordinates of the bow relative to viewport
    const x = avatarRect.left + avatarRect.width * 0.65;
    const y = avatarRect.top + avatarRect.height * 0.25;

    for (let i = 0; i < 3; i++) {
        const offset = (Math.random() - 0.5) * 60;
        particles.push(new SparkleParticle(x + offset, y + offset));
    }
}

// Simple synthesizer sound on button click
function playCuteSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const audioCtx = new AudioContext();
        
        // Simple "Pop/Meow" sound
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        // Frequency slide upwards for a cute pop
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
        console.log("AudioContext is blocked by browser policy until user interaction");
    }
}

// --- 4. SWEET TREATS CAROUSEL ---
const track = document.getElementById('carousel-track');
const slides = Array.from(track.children);
const nextBtn = document.getElementById('carousel-next');
const prevBtn = document.getElementById('carousel-prev');
const dotsNav = document.getElementById('carousel-dots');
const dots = Array.from(dotsNav.children);

let slideWidth = slides[0].getBoundingClientRect().width;

// Arrange slides next to each other
const setSlidePosition = (slide, index) => {
    slide.style.left = slideWidth * index + 'px';
};
slides.forEach(setSlidePosition);

// Recalculate slide positions on resize
window.addEventListener('resize', () => {
    slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach(setSlidePosition);
    moveToSlide(track, track.querySelector('.current-slide'), track.querySelector('.current-slide'));
});

const moveToSlide = (track, currentSlide, targetSlide) => {
    track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
    currentSlide.classList.remove('current-slide');
    targetSlide.classList.add('current-slide');
};

const updateDots = (currentDot, targetDot) => {
    currentDot.classList.remove('current-dot');
    targetDot.classList.add('current-dot');
};

// Next slide logic
nextBtn.addEventListener('click', () => {
    const currentSlide = track.querySelector('.current-slide');
    let nextSlide = currentSlide.nextElementSibling;
    const currentDot = dotsNav.querySelector('.current-dot');
    let nextDot = currentDot.nextElementSibling;

    // Loop back to start if at end
    if (!nextSlide) {
        nextSlide = slides[0];
        nextDot = dots[0];
    }

    moveToSlide(track, currentSlide, nextSlide);
    updateDots(currentDot, nextDot);
});

// Previous slide logic
prevBtn.addEventListener('click', () => {
    const currentSlide = track.querySelector('.current-slide');
    let prevSlide = currentSlide.previousElementSibling;
    const currentDot = dotsNav.querySelector('.current-dot');
    let prevDot = currentDot.previousElementSibling;

    // Loop back to end if at start
    if (!prevSlide) {
        prevSlide = slides[slides.length - 1];
        prevDot = dots[dots.length - 1];
    }

    moveToSlide(track, currentSlide, prevSlide);
    updateDots(currentDot, prevDot);
});

// Dots navigation logic
dotsNav.addEventListener('click', e => {
    const targetDot = e.target.closest('button');
    if (!targetDot) return;

    const currentSlide = track.querySelector('.current-slide');
    const currentDot = dotsNav.querySelector('.current-dot');
    const targetIndex = dots.indexOf(targetDot);
    const targetSlide = slides[targetIndex];

    moveToSlide(track, currentSlide, targetSlide);
    updateDots(currentDot, targetDot);
});

// Auto slide every 5 seconds
let autoSlideInterval = setInterval(() => {
    nextBtn.click();
}, 5000);

// Pause auto slide on hover
const carouselContainer = document.querySelector('.carousel-container');
carouselContainer.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
});
carouselContainer.addEventListener('mouseleave', () => {
    autoSlideInterval = setInterval(() => {
        nextBtn.click();
    }, 5000);
});

// --- 5. WALLPAPERS LIGHTBOX GRID ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const imgSrc = item.getAttribute('data-src');
        const captionText = item.querySelector('img').getAttribute('alt');
        
        lightbox.style.display = 'block';
        lightboxImg.src = imgSrc;
        lightboxCaption.textContent = captionText;
        
        // Spawn sparkles on open
        for (let i = 0; i < 15; i++) {
            particles.push(new SparkleParticle(window.innerWidth / 2 + (Math.random() - 0.5) * 200, window.innerHeight / 2 + (Math.random() - 0.5) * 200));
        }
    });
});

lightboxClose.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

// Close lightbox on click outside the image
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
    }
});

// --- 6. NEWSLETTER SIGN-UP FORM ---
const clubForm = document.getElementById('club-form');
const clubEmail = document.getElementById('club-email');
const formFeedback = document.getElementById('form-feedback');

clubForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = clubEmail.value.trim();
    if (email) {
        formFeedback.textContent = '🎀 Đang gửi tình yêu thương đến bạn...';
        formFeedback.className = 'form-feedback success';
        
        setTimeout(() => {
            formFeedback.textContent = '✨ Cảm ơn bạn! Đăng ký thành công Sweet Club! Check mail để đón Kitty nhé! 🌸';
            clubEmail.value = '';
            
            // Sparkle burst on successful signup!
            const formRect = clubForm.getBoundingClientRect();
            for (let i = 0; i < 30; i++) {
                particles.push(new SparkleParticle(formRect.left + formRect.width / 2 + (Math.random() - 0.5) * 300, formRect.top + formRect.height / 2 + (Math.random() - 0.5) * 50));
            }
        }, 1200);
    } else {
        formFeedback.textContent = '❌ Vui lòng nhập địa chỉ email hợp lệ!';
        formFeedback.className = 'form-feedback error';
    }
});

// --- 7. HEADER SCROLL & ACTIVE LINK NAVIGATION ---
const header = document.querySelector('.header');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    // 1. Header background blur on scroll
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // 2. Navigation Link Highlighting on Scroll
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150; // offset for nav header height
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});
