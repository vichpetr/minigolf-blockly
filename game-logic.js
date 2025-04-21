class GolfGame {
    constructor(canvasId, course) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.course = course;

        // Načtení textur
        this.backgroundTexture = new Image();
        this.backgroundTexture.src = 'img/textures/background.png';

        this.ballTexture = new Image();
        this.ballTexture.src = 'img/textures/golf_ball_blue.png';

        this.obstacleTexture = new Image();
        this.obstacleTexture.src = 'img/textures/rectangle_obstacle.png';

        this.circleObstacleTexture = new Image();
        this.circleObstacleTexture.src = 'img/textures/circle_obstacle.png';

        this.holeTexture = new Image();
        this.holeTexture.src = 'img/textures/hole.png';

        this.flagTexture = new Image();
        this.flagTexture.src = 'img/textures/flag.png';

        this.startTexture = new Image();
        this.startTexture.src = 'img/textures/start.png'; // Přidání textury startu

        this.texturesLoaded = 0; // Počítadlo načtených textur
        this.totalTextures = 7; // Celkový počet textur (včetně startu)

        this.ball = {
            x: course.start.x,
            y: course.start.y,
            vx: 0,
            vy: 0,
            radius: 10
        };
        this.path = [];
        this.allPaths = [];
        this.isRunning = false;
        this.commandQueue = [];
        this.commandNumber = 0;
        this.currentCommandNumber = 0;
    }

    init() {
        // Po načtení každé textury zvyšte počítadlo a vykreslete, pokud jsou všechny textury načteny
        const onTextureLoad = () => {
            this.texturesLoaded++;
            if (this.texturesLoaded === this.totalTextures) {
                this.render(); // Vykreslit hru, jakmile jsou všechny textury načteny
            }
        };

        // Přidání události onload pro každou texturu
        this.backgroundTexture.onload = onTextureLoad;
        this.ballTexture.onload = onTextureLoad;
        this.obstacleTexture.onload = onTextureLoad;
        this.circleObstacleTexture.onload = onTextureLoad;
        this.holeTexture.onload = onTextureLoad;
        this.flagTexture.onload = onTextureLoad;
        this.startTexture.onload = onTextureLoad; // Načtení textury startu

        // Nastavení velikosti plátna
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    queueCommand(power, angle) {
        this.commandNumber++;
        const commandNumber = this.commandNumber;
        console.log(`Command ${commandNumber}: Power ${power}, Angle ${angle}`)
        this.commandQueue.push({ power, angle, commandNumber });
        this.processQueue();
    }

    processQueue() {
        if (this.isRunning || this.commandQueue.length === 0) {
            return;
        }

        const { power, angle, commandNumber } = this.commandQueue.shift();
        this.applyForce(power, angle, commandNumber);
    }

    applyForce(power, angle, commandNumber) {
        this.isRunning = true;

        this.allPaths.push({
            path: [{ x: this.ball.x, y: this.ball.y }],
            commandNumber
        });

        const radians = angle * Math.PI / 180;
        this.ball.vx += Math.cos(radians) * power * 0.1;
        this.ball.vy += Math.sin(radians) * power * 0.1;
        this.gameLoop();
    }

    checkCollisions() {
        this.course.obstacles.forEach(obs => {
            if (obs.type === 'circle') {
                this.handleCircleCollision(obs);
            } else {
                this.handleRectCollision(obs);
            }
        });
        this.checkBoundaries();
    }

    handleCircleCollision(obs) {
        const dx = this.ball.x - obs.x;
        const dy = this.ball.y - obs.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.ball.radius + obs.radius) {
            const angle = Math.atan2(dy, dx);
            const speed = Math.hypot(this.ball.vx, this.ball.vy);

            this.ball.vx = Math.cos(angle) * speed * 0.8;
            this.ball.vy = Math.sin(angle) * speed * 0.8;
        }
    }

    handleRectCollision(obs) {
        const ballNextX = this.ball.x + this.ball.vx;
        const ballNextY = this.ball.y + this.ball.vy;

        if (ballNextX + this.ball.radius > obs.x &&
            ballNextX - this.ball.radius < obs.x + obs.width &&
            ballNextY + this.ball.radius > obs.y &&
            ballNextY - this.ball.radius < obs.y + obs.height) {

            const overlapX = Math.min(
                Math.abs(ballNextX + this.ball.radius - obs.x),
                Math.abs(ballNextX - this.ball.radius - (obs.x + obs.width))
            );

            const overlapY = Math.min(
                Math.abs(ballNextY + this.ball.radius - obs.y),
                Math.abs(ballNextY - this.ball.radius - (obs.y + obs.height))
            );

            if (overlapX < overlapY) {
                this.ball.vx *= -0.8;
            } else {
                this.ball.vy *= -0.8;
            }
        }
    }

    checkBoundaries() {
        const canvas = this.canvas;

        if (this.ball.x < -100 ||
            this.ball.x > canvas.width + 100 ||
            this.ball.y < -100 ||
            this.ball.y > canvas.height + 100) {
            this.reset();
            return;
        }

        if (this.ball.x - this.ball.radius < 0 ||
            this.ball.x + this.ball.radius > canvas.width) {
            this.ball.vx *= -0.8;
            this.ball.x = Math.max(this.ball.radius,
                Math.min(canvas.width - this.ball.radius, this.ball.x));
        }

        if (this.ball.y - this.ball.radius < 0 ||
            this.ball.y + this.ball.radius > canvas.height) {
            this.ball.vy *= -0.8;
            this.ball.y = Math.max(this.ball.radius,
                Math.min(canvas.height - this.ball.radius, this.ball.y));
        }
    }

    gameLoop() {
        if (!this.isRunning) {
            return;
        }

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        this.ball.vx *= 0.98;
        this.ball.vy *= 0.98;

        const currentPath = this.allPaths[this.allPaths.length - 1].path;
        currentPath.push({ x: this.ball.x, y: this.ball.y });

        this.checkCollisions();
        this.render();

        if (Math.hypot(this.ball.vx, this.ball.vy) > 0.1) {
            setTimeout(() => this.gameLoop(), 50);
        } else {
            this.stopGame();
            this.processQueue();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Vykreslení pozadí
        this.ctx.drawImage(this.backgroundTexture, 0, 0, this.canvas.width, this.canvas.height);

        // Vykreslení startu
        this.ctx.drawImage(
            this.startTexture,
            this.course.start.x - 20, // Posun pro zarovnání textury
            this.course.start.y - 20, // Posun pro zarovnání textury
            40, // Šířka textury
            40  // Výška textury
        );

        // Vykreslení všech trajektorií
        this.allPaths.forEach(({ path, commandNumber }) => {
            if (path.length > 1) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = 'red';
                this.ctx.setLineDash([5, 5]);
                this.ctx.moveTo(path[0].x, path[0].y);

                for (let i = 1; i < path.length; i++) {
                    this.ctx.lineTo(path[i].x, path[i].y);
                }

                this.ctx.stroke();
                this.ctx.setLineDash([]);

                // Vykreslení čísla tahu na začátku trajektorie
                this.ctx.beginPath();
                this.ctx.arc(path[0].x, path[0].y, 15, 0, Math.PI * 2);
                this.ctx.fillStyle = 'yellow';
                this.ctx.fill();
                this.ctx.strokeStyle = 'black';
                this.ctx.stroke();

                this.ctx.font = '14px Arial';
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(commandNumber, path[0].x - 5, path[0].y + 5);
            }
        });

        // Vykreslení překážek
        this.course.obstacles.forEach(obs => {
            if (obs.type === 'circle') {
                this.ctx.drawImage(
                    this.circleObstacleTexture,
                    obs.x - obs.radius,
                    obs.y - obs.radius,
                    obs.radius * 2,
                    obs.radius * 2
                );
            } else {
                this.ctx.drawImage(
                    this.obstacleTexture,
                    obs.x,
                    obs.y,
                    obs.width,
                    obs.height
                );
            }
        });

        // Vykreslení jamky
        this.ctx.drawImage(
            this.holeTexture,
            this.course.hole.x - this.course.hole.radius,
            this.course.hole.y - this.course.hole.radius,
            this.course.hole.radius * 2,
            this.course.hole.radius * 2
        );

        // Vykreslení vlaječky nad jamkou
        this.ctx.drawImage(
            this.flagTexture,
            this.course.hole.x - this.course.hole.radius / 2,
            this.course.hole.y - this.course.hole.radius * 3,
            this.course.hole.radius,
            this.course.hole.radius * 3
        );

        // Vykreslení míčku
        this.ctx.drawImage(
            this.ballTexture,
            this.ball.x - this.ball.radius,
            this.ball.y - this.ball.radius,
            this.ball.radius * 2,
            this.ball.radius * 2
        );
    }

    stopGame() {
        this.isRunning = false;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }

    reset() {
        this.stopGame();
        this.commandQueue = [];
        this.commandNumber = 0;
        this.currentCommandNumber = 0;
        this.path = [];
        this.allPaths = [];
        this.ball.x = this.course.start.x;
        this.ball.y = this.course.start.y;
        this.render();
    }
}
