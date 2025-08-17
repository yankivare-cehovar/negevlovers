
document.addEventListener('DOMContentLoaded', () => {
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        initializeGame();
    }
});

function initializeGame() {
    // --- DOM Elements ---
    const gameScreen = document.getElementById('game-screen');
    const scoreDisplay = document.getElementById('score');
    const ammoDisplay = document.getElementById('ammo');
    const weaponViewModel = document.getElementById('weapon-viewmodel');
    const mapSelectionContainer = document.querySelector('.map-selection');
    const comboDisplay = document.getElementById('combo-display');

    // Audio Elements
    const negevSound = document.getElementById('negev-sound');
    const hitSound = document.getElementById('hit-sound');
    const killSound = document.getElementById('kill-sound');
    const reloadSound = document.getElementById('reload-sound');
    const allyHitSound = document.getElementById('hostage-hit-sound'); // Renamed from hostage_hit.mp3

    // Overlays and Screens
    const startGameOverlay = document.getElementById('start-game-overlay');
    const startGameButton = document.getElementById('start-game-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const playAgainButton = document.getElementById('play-again-button');

    // Stats Displays
    const highScoreDisplayStart = document.getElementById('high-score-display-start');
    const finalScoreDisplay = document.getElementById('final-score');
    const finalAccuracyDisplay = document.getElementById('final-accuracy');
    const finalHighScoreDisplay = document.getElementById('final-high-score');

    // Game Controls
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const frequencySlider = document.getElementById('frequency-slider');
    const frequencyValue = document.getElementById('frequency-value');
    const negevSizeSlider = document.getElementById('negev-size-slider');
    const negevSizeValue = document.getElementById('negev-size-value');
    const directionControls = document.getElementById('direction-controls');

    // --- Game State Variables ---
    const CLIP_SIZE = 150;
    const RELOAD_TIME = 3000;
    let score = 0;
    let clipAmmo = CLIP_SIZE;
    let reserveAmmo = 300;
    let totalShots = 0;
    let totalHits = 0;
    let highScore = localStorage.getItem('negevWhackHighScore') || 0;
    let comboCounter = 0;
    let shotBurstCount = 0; // Tracks shots in a single burst for recoil
    let isFiring = false;
    let isReloading = false;
    let recoilOffset = 0;
    const MAX_RECOIL = 100;
    let fireInterval;
    let targetInterval;
    let recoilInterval;
    let spawnDirection = 'ltr';

    // --- Maps Configuration ---
    const maps = [
        { name: 'Dust II', image: 'assets/images/game1bg1dust.jpeg' },
        { name: 'Inferno', image: 'assets/images/game1bg2inferno.jpeg' }
    ];

    // --- Core Functions ---
    function startGame() {
        gameOverScreen.style.display = 'none';
        startGameOverlay.style.display = 'none';
        
        score = 0;
        clipAmmo = CLIP_SIZE;
        reserveAmmo = 300;
        totalShots = 0;
        totalHits = 0;
        recoilOffset = 0;
        resetCombo();
        scoreDisplay.textContent = score;
        updateAmmoDisplay();

        const frequency = frequencySlider.value;
        targetInterval = setInterval(createTarget, frequency);

        let currentEvent = {};
        gameScreen.onmousemove = (moveEvent) => { currentEvent = moveEvent; };
        
        gameScreen.onmousedown = (e) => {
            if (isReloading) return;
            isFiring = true;
            shotBurstCount = 0;
            currentEvent = e;
            clearInterval(fireInterval);
            fireInterval = setInterval(() => fire(currentEvent), 100);
            weaponViewModel.classList.add('continuous-shake');

            clearInterval(recoilInterval);
            recoilInterval = setInterval(() => {
                if (recoilOffset < MAX_RECOIL) recoilOffset += 2;
            }, 20);
        };

        window.onmouseup = () => {
            isFiring = false;
            shotBurstCount = 0;
            clearInterval(fireInterval);
            weaponViewModel.classList.remove('continuous-shake');

            clearInterval(recoilInterval);
            recoilInterval = setInterval(() => {
                if (recoilOffset > 0) {
                    recoilOffset -= 2;
                } else {
                    recoilOffset = 0;
                    clearInterval(recoilInterval);
                }
            }, 10);
        };

        window.onkeydown = (e) => {
            if (e.key === 'r' || e.key === 'R') reload();
        };
    }

    function endGame() {
        clearInterval(fireInterval);
        clearInterval(targetInterval);
        clearInterval(recoilInterval);
        isFiring = false;
        gameScreen.onmousedown = null;
        gameScreen.onmousemove = null;
        window.onmouseup = null;
        window.onkeydown = null;

        document.querySelectorAll('.target, .bullet-hole').forEach(el => el.remove());

        const accuracy = totalShots > 0 ? ((totalHits / totalShots) * 100).toFixed(1) : 0;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('negevWhackHighScore', highScore);
        }

        if (finalScoreDisplay) finalScoreDisplay.textContent = score;
        if (finalAccuracyDisplay) finalAccuracyDisplay.textContent = `${accuracy}%`;
        if (finalHighScoreDisplay) finalHighScoreDisplay.textContent = highScore;
        updateHighScoreDisplays();

        gameOverScreen.style.display = 'flex';
    }

    function fire(e) {
        if (isReloading || clipAmmo <= 0) {
            if (clipAmmo <= 0 && !isReloading) reload();
            return;
        }

        clipAmmo--;
        totalShots++;
        shotBurstCount++;
        updateAmmoDisplay();

        const verticalRecoil = recoilOffset;
        const horizontalDeviation = (shotBurstCount <= 10) ? (recoilOffset / 2) : 5;

        const rect = gameScreen.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const bulletX = mouseX + (Math.random() - 0.5) * horizontalDeviation;
        const bulletY = (mouseY - verticalRecoil) + (Math.random() - 0.5) * (horizontalDeviation / 2);

        playSound(negevSound);

        let hitRegistered = false;
        document.querySelectorAll('.target').forEach(target => {
            if (target.dataset.health <= 0) return;

            const head = target.querySelector('.head');
            const body = target.querySelector('.body');
            const headRect = head.getBoundingClientRect();
            const bodyRect = body.getBoundingClientRect();

            if (bulletX > headRect.left - rect.left && bulletX < headRect.right - rect.left &&
                bulletY > headRect.top - rect.top && bulletY < headRect.bottom - rect.top) {
                handleHit(target, 98, true);
                hitRegistered = true;
            } else if (bulletX > bodyRect.left - rect.left && bulletX < bodyRect.right - rect.left &&
                bulletY > bodyRect.top - rect.top && bulletY < bodyRect.bottom - rect.top) {
                const damage = Math.floor(Math.random() * (35 - 21 + 1)) + 21;
                handleHit(target, damage, false);
                hitRegistered = true;
            }
        });

        const bulletHole = document.createElement('div');
        bulletHole.classList.add('bullet-hole');
        if (hitRegistered) {
            bulletHole.classList.add('hit');
        } else {
            resetCombo();
        }
        bulletHole.style.left = `${bulletX}px`;
        bulletHole.style.top = `${bulletY}px`;
        gameScreen.appendChild(bulletHole);
        setTimeout(() => bulletHole.remove(), 2000);

        if(hitRegistered) totalHits++;

        if (clipAmmo <= 0) {
            if (reserveAmmo > 0) reload();
            else endGame();
        }
    }

    function handleHit(target, damage, wasHeadshot) {
        if (target.dataset.type === 'ally') {
            playSound(allyHitSound);
            score -= 2; // Penalty per hit
            if (scoreDisplay) scoreDisplay.textContent = score;
            resetCombo();

            let currentHealth = parseInt(target.dataset.health) - damage;
            target.dataset.health = currentHealth;
            
            const healthBar = target.querySelector('.health-bar');
            if (healthBar) healthBar.style.width = `${Math.max(0, currentHealth)}%`;

            if (currentHealth <= 0) {
                score -= 8; // Additional penalty for killing ally
                if (scoreDisplay) scoreDisplay.textContent = score;
                target.remove();
            }
            return;
        }

        playSound(hitSound);
        comboCounter++;
        updateComboDisplay();

        let currentHealth = parseInt(target.dataset.health) - damage;
        target.dataset.health = currentHealth;
        
        const healthBar = target.querySelector('.health-bar');
        if (healthBar) healthBar.style.width = `${Math.max(0, currentHealth)}%`;

        if (currentHealth <= 0) {
            playSound(killSound);
            const basePoints = wasHeadshot ? 3 : 1;
            const multiplier = Math.max(1, Math.floor(comboCounter / 5));
            score += basePoints * multiplier;
            if (scoreDisplay) scoreDisplay.textContent = score;
            target.remove();
        }
    }

    function createTarget() {
        const target = document.createElement('div');
        target.classList.add('target');

        if (Math.random() < 0.15) {
            target.classList.add('ally');
            target.dataset.type = 'ally';
            target.style.backgroundImage = "url('assets/images/ally.png')"; // Placeholder image
            target.dataset.health = 100;
        } else {
            target.dataset.type = 'terrorist';
                        target.style.backgroundImage = "url('assets/images/terorist.png')";
            target.dataset.health = 100;
        }

        const scale = Math.random() * 0.5 + 0.7;
        target.style.transform = `scale(${scale})`;
        target.style.zIndex = Math.floor(scale * 10);

        const head = document.createElement('div');
        head.classList.add('head');
        const body = document.createElement('div');
        body.classList.add('body');
        
        const healthBarContainer = document.createElement('div');
        healthBarContainer.classList.add('health-bar-container');
        const healthBar = document.createElement('div');
        healthBar.classList.add('health-bar');
        healthBarContainer.appendChild(healthBar);

        target.appendChild(head);
        target.appendChild(body);
        target.appendChild(healthBarContainer);

        const baseSpeed = (parseInt(speedSlider.max) + parseInt(speedSlider.min)) - parseInt(speedSlider.value);
        const finalSpeed = baseSpeed / scale;
        target.style.animationDuration = `${finalSpeed}s`;
        
        target.style.top = `${Math.random() * (gameScreen.offsetHeight - (220 * scale))}px`;

        let direction = spawnDirection;
        if (direction === 'both') direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
        target.style.animationName = direction === 'ltr' ? 'moveAcrossLtr' : 'moveAcrossRtl';

        gameScreen.appendChild(target);
        setTimeout(() => target.remove(), finalSpeed * 1000);
    }

    function reload() {
        if (isReloading || reserveAmmo <= 0 || clipAmmo === CLIP_SIZE) return;
        playSound(reloadSound);
        isReloading = true;
        weaponViewModel.classList.remove('continuous-shake');
        updateAmmoDisplay();
        setTimeout(() => {
            const ammoNeeded = CLIP_SIZE - clipAmmo;
            const ammoToReload = Math.min(ammoNeeded, reserveAmmo);
            clipAmmo += ammoToReload;
            reserveAmmo -= ammoToReload;
            isReloading = false;
            updateAmmoDisplay();
        }, RELOAD_TIME);
    }

    function updateAmmoDisplay() {
        if (isReloading) {
            ammoDisplay.textContent = "RELOADING...";
        } else {
            ammoDisplay.textContent = `${clipAmmo} / ${reserveAmmo}`;
        }
    }

    function updateHighScoreDisplays() {
        if (highScoreDisplayStart) highScoreDisplayStart.textContent = `High Score: ${highScore}`;
        if (finalHighScoreDisplay) finalHighScoreDisplay.textContent = highScore;
    }

    function resetCombo() {
        comboCounter = 0;
        updateComboDisplay();
    }

    function updateComboDisplay() {
        const multiplier = Math.max(1, Math.floor(comboCounter / 5));
        if (comboDisplay) {
            comboDisplay.textContent = `x${multiplier}`;
            comboDisplay.style.color = multiplier > 1 ? '#f59e0b' : 'white';
        }
    }

    function playSound(soundElement) {
        if (soundElement) {
            soundElement.currentTime = 0;
            soundElement.play().catch(e => console.log("Audio play failed: " + e));
        }
    }

    // --- Initial Setup & Event Listeners ---
    function setupUI() {
        updateHighScoreDisplays();
        updateComboDisplay();
        
        if (speedSlider) speedSlider.addEventListener('input', (e) => {
            const speed = (parseInt(e.target.max) + parseInt(e.target.min)) - parseInt(e.target.value);
            if (speedValue) speedValue.textContent = `${speed}s`;
        });
        if (frequencySlider) frequencySlider.addEventListener('input', (e) => {
            if (frequencyValue) frequencyValue.textContent = `${e.target.value}ms`;
            if (startGameOverlay.style.display === 'none' && !isReloading) {
                clearInterval(targetInterval);
                targetInterval = setInterval(createTarget, e.target.value);
            }
        });
        if (negevSizeSlider) negevSizeSlider.addEventListener('input', (e) => {
            const newSize = e.target.value;
            if (negevSizeValue) negevSizeValue.textContent = `${newSize}%`;
            if (weaponViewModel) weaponViewModel.style.width = `${newSize}%`;
        });
        if (directionControls) directionControls.addEventListener('change', (e) => {
            if (e.target.name === 'direction') spawnDirection = e.target.value;
        });

        if (mapSelectionContainer) {
            maps.forEach((map, index) => {
                const mapButton = document.createElement('button');
                mapButton.classList.add('map-button');
                mapButton.textContent = map.name;
                mapButton.style.backgroundImage = `url('${map.image}')`;
                mapButton.addEventListener('click', () => {
                    if(isReloading) return;
                    if (gameScreen) {
                        gameScreen.style.backgroundImage = `url('${map.image}')`;
                        gameScreen.style.backgroundSize = '100% 100%';
                        gameScreen.style.backgroundPosition = 'center';
                    }
                    document.querySelectorAll('.map-button').forEach(btn => btn.classList.remove('active'));
                    mapButton.classList.add('active');
                });
                mapSelectionContainer.appendChild(mapButton);
                if (index === 0) mapButton.click();
            });
        }

        if (startGameButton) startGameButton.addEventListener('click', startGame);
        if (playAgainButton) playAgainButton.addEventListener('click', startGame);

        if (negevSizeValue) negevSizeValue.textContent = `${negevSizeSlider.value}%`;
        if (weaponViewModel) weaponViewModel.style.width = `${negevSizeSlider.value}%`;
    }

    setupUI();
}
