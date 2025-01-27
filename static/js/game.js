class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audioManager = new AudioManager();

        this.canvas.width = 800;
        this.canvas.height = 600;

        // Adjusted player position closer to aliens
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 40,
            height: 30,
            speed: 5
        };

        this.bullets = [];
        this.aliens = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.debugMode = true; // Enable debug visualization

        this.keys = {};
        this.setupEventListeners();
        this.initializeAliens();
        this.lastTime = 0;
        this.alienDirection = 1;
        this.alienStepDown = false;
        this.alienMoveTimer = 0;
        this.alienMoveInterval = 1000; // Slower alien movement

        this.canvas.focus();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    setupEventListeners() {
        this.canvas.tabIndex = 1;

        window.addEventListener('keydown', (e) => {
            if(['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            if(['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = false;
        });

        document.getElementById('restartButton').addEventListener('click', () => this.restart());

        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
    }

    initializeAliens() {
        const rows = 5;
        const cols = 10;
        const padding = 60;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.aliens.push({
                    x: col * padding + 100,
                    y: row * padding + 50,
                    width: 30,  // Slightly smaller aliens
                    height: 30
                });
            }
        }
    }

    update(deltaTime) {
        if (this.gameOver) return;

        if (this.keys['ArrowLeft']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
        if (this.keys[' '] && !this.keys.spacePressed) {
            this.shoot();
            this.keys.spacePressed = true;
        }
        if (!this.keys[' ']) {
            this.keys.spacePressed = false;
        }

        // Update bullets with much faster speed
        this.bullets.forEach((bullet, index) => {
            bullet.y -= 30; // Increased bullet speed significantly
            if (bullet.y < 0) {
                this.bullets.splice(index, 1);
            }
        });

        // Move aliens
        this.alienMoveTimer += deltaTime;
        if (this.alienMoveTimer >= this.alienMoveInterval) {
            this.moveAliens();
            this.alienMoveTimer = 0;
        }

        this.checkCollisions();
    }

    moveAliens() {
        let touchedEdge = false;

        this.aliens.forEach(alien => {
            if (this.alienStepDown) {
                alien.y += 30;
            } else {
                alien.x += 30 * this.alienDirection;
            }

            if (alien.x <= 0 || alien.x + alien.width >= this.canvas.width) {
                touchedEdge = true;
            }
        });

        if (touchedEdge && !this.alienStepDown) {
            this.alienDirection *= -1;
            this.alienStepDown = true;
        } else {
            this.alienStepDown = false;
        }

        this.aliens.forEach(alien => {
            if (alien.y + alien.height >= this.player.y) {
                this.endGame();
            }
        });
    }

    shoot() {
        const bullet = {
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y - 10,
            width: 4,
            height: 15
        };
        this.bullets.push(bullet);
        this.audioManager.playSound('shoot');
        console.log('Bullet created at:', bullet.x, bullet.y); // Debug log
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.aliens.length - 1; j >= 0; j--) {
                const alien = this.aliens[j];
                // Simplified collision check with slightly larger hit area
                if (bullet.x < alien.x + alien.width &&
                    bullet.x + bullet.width > alien.x &&
                    bullet.y < alien.y + alien.height &&
                    bullet.y + bullet.height > alien.y) {

                    console.log('Collision detected!'); // Debug log
                    this.bullets.splice(i, 1);
                    this.aliens.splice(j, 1);
                    this.score += 100;
                    this.audioManager.playSound('explosion');
                    document.getElementById('score').textContent = this.score;
                    break;
                }
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw bullets
        this.ctx.fillStyle = '#0f0';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw aliens
        this.ctx.fillStyle = '#f00';
        this.aliens.forEach(alien => {
            this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        });

        // Debug visualization
        if (this.debugMode) {
            this.bullets.forEach(bullet => {
                this.ctx.strokeStyle = '#0ff';
                this.ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
            });
            this.aliens.forEach(alien => {
                this.ctx.strokeStyle = '#ff0';
                this.ctx.strokeRect(alien.x, alien.y, alien.width, alien.height);
            });
        }
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        if (!this.gameOver) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    endGame() {
        this.gameOver = true;
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
    }

    restart() {
        this.aliens = [];
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.player.x = this.canvas.width / 2;
        this.initializeAliens();
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('score').textContent = '0';
        document.getElementById('lives').textContent = '3';
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

window.addEventListener('load', () => {
    new Game();
});