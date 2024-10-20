const soundIcon = document.getElementById('sound-icon');
const ball = document.getElementById('ball');
const audioPlayer = document.getElementById('audio-player');
const board = document.getElementById('board');
const modeToggle = document.getElementById('mode-toggle');
const originalTransform = 'translateZ(0)';
let chargingTime = 0;
let chargingInterval;
let isDarkMode = true; // Default to dark mode

document.addEventListener('DOMContentLoaded', () => {
    // Immediately apply dark mode styles on page load
    document.body.style.background = 'linear-gradient(45deg, #1c1c1c, #00504e, #002275, #5e2401, #141414)';
    board.style.background = 'linear-gradient(-90deg, #464646, #9f9f9f)';
});

soundIcon.addEventListener('mousedown', startCharging);
soundIcon.addEventListener('mouseup', launchBall);

function startCharging() {
    chargingTime = 0;
    soundIcon.style.transform = 'rotate(-50deg)';
    chargingInterval = setInterval(() => {
        chargingTime += 100;
    }, 100);
}

function launchBall() {
    clearInterval(chargingInterval);
    const initialX = soundIcon.offsetLeft + soundIcon.offsetWidth / 2;
    const initialY = soundIcon.offsetTop;
    ball.style.left = `${initialX}px`;
    ball.style.top = `${initialY}px`;
    ball.style.display = 'block';

    const launchAngle = 45;
    moveBall(initialX, initialY, launchAngle);

    setTimeout(() => {
        soundIcon.style.transform = 'rotate(0deg)';
    }, 300);
}

function moveBall(initialX, initialY, angleInDegrees) {
    const gravity = 0.4;
    const angleInRadians = angleInDegrees * (Math.PI / 180);

    let initialSpeed = chargingTime / 30;
    if (initialSpeed < 1) initialSpeed = 1;

    let velocityX = initialSpeed * Math.cos(angleInRadians);
    let velocityY = -initialSpeed * Math.sin(angleInRadians);

    let posX = initialX;
    let posY = initialY;

    const volumeLineWidth = 400;

    const interval = setInterval(() => {
        posX += velocityX;
        posY += velocityY;
        velocityY += gravity;

        drawBall(posX, posY);

        if (posY >= (initialY + 120)) {
            clearInterval(interval);

            if (posX <= (initialX + volumeLineWidth)) {
                posY = initialY + 120;
                drawBall(posX, posY);
                updateVolume(posX);
                audioPlayer.currentTime = 0;
                audioPlayer.play();
            } else {
                audioPlayer.volume = 0;
                console.log('Volume: 0%');
            }
        }
    }, 30);
}

function drawBall(x, y) {
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
}

function updateVolume(landingPosition) {
    const volumeLineWidth = 400;
    const volumePercent = Math.min(Math.max((landingPosition - 20) / volumeLineWidth, 0), 1);
    audioPlayer.volume = volumePercent;
    console.log('Volume:', Math.round(volumePercent * 100) + '%');
}

// Toggle dark/light mode
modeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.style.background = isDarkMode ?
        'linear-gradient(45deg, #1c1c1c, #00504e, #002275, #5e2401, #141414)' : // Dark mode
        'linear-gradient(45deg, #f65656, #f4a264, #69eaea, #5360eb, #cb6fea)'; // Light mode
    board.style.background = isDarkMode ?
        'linear-gradient(-90deg, #464646, #9f9f9f)' : // Dark mode
        'linear-gradient(-90deg, #f0f0f0, #ffffff)'; // Light mode

    modeToggle.style.opacity = 0; // Start fade-out
    setTimeout(() => {
        modeToggle.src = isDarkMode ? 'darkmode.png' : 'lightmode.png';
        modeToggle.style.opacity = 1; // Fade-in
    }, 500);
});

// Board movement based on mouse position
board.addEventListener('mousemove', (event) => {
    const { clientX, clientY } = event;
    const { offsetWidth, offsetHeight } = board;

    const boardRect = board.getBoundingClientRect();
    const centerX = boardRect.left + offsetWidth / 2;
    const centerY = boardRect.top + offsetHeight / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const tiltX = (deltaY / offsetHeight) * 20; // Max tilt
    const tiltY = (deltaX / offsetWidth) * -20; // Max tilt

    board.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
});

// Reset board position when mouse leaves
board.addEventListener('mouseleave', () => {
    board.style.transform = originalTransform;
});
