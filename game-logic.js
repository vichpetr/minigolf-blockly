class GolfGame {
    constructor(canvasId, course, levels) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.course = course;
        this.levels = levels;

        // Další vlastnosti...
        this.completedLevels = []; // Seznam splněných levelů
        this.results = {}; // Výsledky: { levelIndex: moves }

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
        this.startTexture.src = 'img/textures/start.png';

        this.woodTexture = new Image(); // Přidání textury dřeva
        this.woodTexture.src = 'img/textures/rectangle_obstacle.png';

        this.texturesLoaded = 0;
        this.totalTextures = 8; // Aktualizováno pro novou texturu

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
        this.startTexture.onload = onTextureLoad;
        this.woodTexture.onload = onTextureLoad;

        // Nastavení velikosti plátna
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Nastavit výchozí level (první)
        this.loadLevel(0);

        // Vygenerovat tlačítka levelů
        this.generateLevelButtons();

        // Přidání posluchače události myši
        this.mouseX = 0;
        this.mouseY = 0;
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = event.clientX - rect.left;
            this.mouseY = event.clientY - rect.top;
            this.render(); // Aktualizovat vykreslení
        });

        // Vytvoření dialogu
        this.createLevelCompleteDialog();

        // Aktualizovat tabulku výsledků
        this.updateResultsTable();
    }

    createLevelCompleteDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'levelCompleteDialog';
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.padding = '20px';
        dialog.style.backgroundColor = 'white';
        dialog.style.border = '2px solid black';
        dialog.style.textAlign = 'center';
        dialog.style.zIndex = '1000';
        dialog.style.display = 'none'; // Skrytý dialog

        dialog.innerHTML = `
            <h2>Level Complete!</h2>
            <p>You completed the level in <strong id="totalMoves"></strong> moves.</p>
            <h3>Completed Levels</h3>
            <ul id="completedLevelsList" style="text-align: left; padding: 0; list-style: none;">
                <!-- Seznam splněných levelů bude dynamicky přidán zde -->
            </ul>
            <button id="nextLevelButton">Next Level</button>
            <button id="restartLevelButton">Restart Level</button>
        `;

        document.body.appendChild(dialog);

        // Přidání funkcionality tlačítek
        const nextLevelButton = document.getElementById('nextLevelButton');
        const restartLevelButton = document.getElementById('restartLevelButton');

        nextLevelButton.addEventListener('click', () => {
            document.getElementById('levelCompleteDialog').style.display = 'none'; // Skrytí dialogu
            this.loadNextLevel(); // Načíst další level
        });

        restartLevelButton.addEventListener('click', () => {
            document.getElementById('levelCompleteDialog').style.display = 'none'; // Skrytí dialogu
            this.reset(); // Restartovat aktuální level
        });
    }

    generateLevelButtons() {
        const levelSelector = document.getElementById('level-selector');
        levelSelector.innerHTML = ''; // Vyčistit předchozí obsah

        this.levels.forEach((level, index) => {
            const button = document.createElement('button');
            button.textContent = `Level ${index + 1}`;
            button.setAttribute('data-title', level.name); // Nastavit název levelu jako tooltip

            // Pokud je level splněný, označit tlačítko
            if (this.completedLevels.includes(index)) {
                button.style.backgroundColor = 'green'; // Změna barvy na zelenou
                button.style.color = 'white';
                button.textContent += ' ✓'; // Přidat ikonu splnění
            }

            // Zvýraznění aktuálního levelu
            if (this.course === level) {
                button.style.border = '2px solid blue'; // Ohraničení aktuálního levelu
                button.style.fontWeight = 'bold';
            }

            button.addEventListener('click', () => this.loadLevel(index));
            levelSelector.appendChild(button);
        });
    }

    loadLevel(levelIndex) {
        const selectedLevel = this.levels[levelIndex];
        this.course = selectedLevel;

        // Aktualizace informací o aktuálním levelu
        const currentLevelInfo = document.getElementById('current-level-info');
        if (currentLevelInfo) {
            currentLevelInfo.textContent = `Current Level: ${selectedLevel.name}`;
        }

        // Zkontrolovat, zda start je uvnitř hranic
        if (!this.isPointInsideBounds(selectedLevel.start.x, selectedLevel.start.y)) {
            console.error('Start position is outside the bounds!');
            //return;
        }

        // Zkontrolovat, zda jamka je uvnitř hranic
        if (!this.isPointInsideBounds(selectedLevel.hole.x, selectedLevel.hole.y)) {
            console.error('Hole position is outside the bounds!');
            return;
        }

        // Nastavit míček na startovní pozici
        this.ball.x = selectedLevel.start.x;
        this.ball.y = selectedLevel.start.y;
        this.ball.vx = 0;
        this.ball.vy = 0;

        // Resetovat hru
        this.reset();

        // Resetovat Blockly pole
        this.resetBlocklyWorkspace();

        // Aktualizovat tlačítka levelů
        this.generateLevelButtons();
    }

    isPointInsideBounds(x, y) {
        if (this.course.bounds.type === 'circle') {
            const dx = x - this.course.bounds.x;
            const dy = y - this.course.bounds.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.course.bounds.radius;
        } else if (this.course.bounds.type === 'polygon') {
            return this.isPointInsidePolygon(x, y, this.course.bounds.points);
        }
        return false;
    }

    isPointInsidePolygon(x, y, points) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;

            const intersect = ((yi > y) !== (yj > y)) &&
                              (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
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
            obs.rotation = obs.rotation || 0; // Nastaví výchozí rotaci na 0, pokud není definována
            if (obs.type === 'circle') {
                this.handleCircleCollision(obs);
            } else {
                this.handleRectCollision(obs);
            }
        });

        // Kontrola, zda míček dosáhl jamky, až po jeho zastavení
        if (Math.hypot(this.ball.vx, this.ball.vy) < 0.1) { // Míček se zastavil
            const dx = this.ball.x - this.course.hole.x;
            const dy = this.ball.y - this.course.hole.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.course.hole.radius) {
                this.showLevelCompleteDialog(); // Zobrazit dialog o splnění levelu
                this.stopGame(); // Ukončit hru
                return;
            }
        }

        this.checkBoundaries();
    }

    showLevelCompleteDialog() {
        const totalMoves = this.commandNumber; // Počet použitých tahů
        const dialog = document.getElementById('levelCompleteDialog');
        const totalMovesElement = document.getElementById('totalMoves');
        totalMovesElement.textContent = totalMoves;

        // Přidání aktuálního levelu do seznamu splněných levelů
        const currentLevelIndex = this.levels.indexOf(this.course);
        if (!this.completedLevels.includes(currentLevelIndex)) {
            this.completedLevels.push(currentLevelIndex); // Přidat aktuální level do splněných
        }

        // Generování seznamu splněných levelů
        const completedLevelsList = document.getElementById('completedLevelsList');
        completedLevelsList.innerHTML = ''; // Vyčistit předchozí obsah
        this.completedLevels.forEach(levelIndex => {
            const levelName = this.levels[levelIndex].name;
            const moves = this.results[levelIndex] || 'N/A'; // Počet tahů nebo "N/A"
            const listItem = document.createElement('li');
            listItem.textContent = `${levelName}: ${moves} moves`;
            completedLevelsList.appendChild(listItem);
        });

        dialog.style.display = 'block'; // Zobrazení dialogu

        // Uložit výsledek pro aktuální level
        this.results[currentLevelIndex] = totalMoves;

        // Aktualizovat tabulku výsledků
        this.updateResultsTable();
    }

    loadNextLevel() {
        const currentLevelIndex = this.levels.indexOf(this.course);
        if (!this.completedLevels.includes(currentLevelIndex)) {
            this.completedLevels.push(currentLevelIndex); // Přidat aktuální level do splněných
        }

        if (currentLevelIndex < this.levels.length - 1) {
            this.loadLevel(currentLevelIndex + 1); // Načíst další level
        } else {
            alert('Congratulations! You completed all levels!');
        }

        this.generateLevelButtons(); // Aktualizovat tlačítka levelů
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
        const cos = Math.cos((obs.rotation * Math.PI) / 180);
        const sin = Math.sin((obs.rotation * Math.PI) / 180);

        const relativeX = this.ball.x - (obs.x + obs.width / 2);
        const relativeY = this.ball.y - (obs.y + obs.height / 2);

        const localX = cos * relativeX + sin * relativeY;
        const localY = -sin * relativeX + cos * relativeY;

        const halfWidth = obs.width / 2;
        const halfHeight = obs.height / 2;

        // Přidání tolerance pro detekci kolizí
        const tolerance = 0.1;

        if (
            Math.abs(localX) <= halfWidth + this.ball.radius + tolerance &&
            Math.abs(localY) <= halfHeight + this.ball.radius + tolerance
        ) {
            const overlapX = halfWidth + this.ball.radius - Math.abs(localX);
            const overlapY = halfHeight + this.ball.radius - Math.abs(localY);

            let normalX = 0;
            let normalY = 0;

            if (overlapX < overlapY) {
                normalX = localX > 0 ? 1 : -1;
            } else {
                normalY = localY > 0 ? 1 : -1;
            }

            const globalNormalX = cos * normalX - sin * normalY;
            const globalNormalY = sin * normalX + cos * normalY;

            const dotProduct =
                this.ball.vx * globalNormalX + this.ball.vy * globalNormalY;

            this.ball.vx -= 2 * dotProduct * globalNormalX;
            this.ball.vy -= 2 * dotProduct * globalNormalY;

            this.ball.vx *= 0.8;
            this.ball.vy *= 0.8;

            // Posun míčku mimo překážku
            this.ball.x += globalNormalX * overlapX;
            this.ball.y += globalNormalY * overlapY;
        }
    }

    checkBoundaries() {
        if (this.course.bounds.type === 'circle') {
            const dx = this.ball.x - this.course.bounds.x;
            const dy = this.ball.y - this.course.bounds.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.course.bounds.radius - this.ball.radius) {
                // Odraz od kruhové hranice
                const angle = Math.atan2(dy, dx);
                const speed = Math.hypot(this.ball.vx, this.ball.vy);

                this.ball.vx = Math.cos(angle) * speed * -0.8;
                this.ball.vy = Math.sin(angle) * speed * -0.8;

                // Posun míčku zpět do hranic
                const overlap = distance - (this.course.bounds.radius - this.ball.radius);
                this.ball.x -= Math.cos(angle) * overlap;
                this.ball.y -= Math.sin(angle) * overlap;
            }
        } else if (this.course.bounds.type === 'polygon') {
            if (!this.isPointInsidePolygon(this.ball.x, this.ball.y, this.course.bounds.points)) {
                console.warn('Ball hit the polygon boundary!');
                //this.reset(); // Resetovat hru, pokud míček opustí hranice
            }
        }
    }

    gameLoop() {
        if (!this.isRunning) {
            return;
        }

        // Aktualizace pozice míčku
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Zpomalení míčku (simulace tření)
        this.ball.vx *= 0.98;
        this.ball.vy *= 0.98;

        // Uložení aktuální trajektorie
        const currentPath = this.allPaths[this.allPaths.length - 1].path;
        currentPath.push({ x: this.ball.x, y: this.ball.y });

        // Kontrola kolizí
        this.checkCollisions();

        // Vykreslení hry
        this.render();

        // Kontrola, zda se míček zastavil
        if (Math.hypot(this.ball.vx, this.ball.vy) > 0.1) {
            requestAnimationFrame(() => this.gameLoop()); // Plynulé volání
        } else {
            this.checkCollisions(); // Zkontrolovat jamku po zastavení
            this.stopGame();
            this.processQueue();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Vykreslení ohraničení herního plánu pomocí textury dřeva
        if (this.course.bounds) {
            this.ctx.save(); // Uložit aktuální stav kontextu

            // Vnější hranice (větší oblast)
            this.ctx.beginPath();
            if (this.course.bounds.type === 'circle') {
                const { x, y, radius } = this.course.bounds;
                this.ctx.arc(x, y, radius + 30, 0, Math.PI * 2); // Větší kruh (ohraničení)
            } else if (this.course.bounds.type === 'polygon') {
                const points = this.course.bounds.points;
                this.ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    this.ctx.lineTo(points[i].x, points[i].y);
                }
                this.ctx.closePath();
            }
            this.ctx.clip(); // Omezit vykreslování na vnější hranici

            // Vykreslení textury dřeva
            const pattern = this.ctx.createPattern(this.woodTexture, 'repeat');
            this.ctx.fillStyle = pattern;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Vnitřní hranice (menší oblast)
            this.ctx.beginPath();
            if (this.course.bounds.type === 'circle') {
                const { x, y, radius } = this.course.bounds;
                this.ctx.arc(x, y, radius, 0, Math.PI * 2); // Menší kruh (vnitřní hranice)
            } else if (this.course.bounds.type === 'polygon') {
                const points = this.course.bounds.points;
                this.ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    this.ctx.lineTo(points[i].x, points[i].y);
                }
                this.ctx.closePath();
            }
            this.ctx.globalCompositeOperation = 'destination-out'; // Vyříznutí vnitřní oblasti
            this.ctx.fill();

            this.ctx.restore(); // Obnovit stav kontextu
        }

        // Vykreslení pozadí herního plánu
        if (this.course.bounds) {
            this.ctx.save();
            this.ctx.beginPath();
            if (this.course.bounds.type === 'circle') {
                const { x, y, radius } = this.course.bounds;
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            } else if (this.course.bounds.type === 'polygon') {
                const points = this.course.bounds.points;
                this.ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    this.ctx.lineTo(points[i].x, points[i].y);
                }
                this.ctx.closePath();
            }
            this.ctx.clip();

            // Vykreslení pozadí
            this.ctx.drawImage(this.backgroundTexture, 0, 0, this.canvas.width, this.canvas.height);

            this.ctx.restore();
        }

        // Vykreslení dalších prvků (startovní pozice, překážky, jamka, vlaječka, míček)
        this.renderGameElements();

         // Vykreslení souřadnic myši
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = 'black';
    //this.ctx.fillText(`X: ${Math.round(this.mouseX)}, Y: ${Math.round(this.mouseY)}`, 10, 20);
    }

    renderGameElements() {
        // Vykreslení trajektorie
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
                this.ctx.font = '14px Arial';
                this.ctx.fillStyle = 'black';
                this.ctx.fillText(commandNumber, path[0].x - 5, path[0].y + 5);
            }
        });

        // Vykreslení startovní pozice
        this.ctx.drawImage(
            this.startTexture,
            this.course.start.x - 20, // Posun pro zarovnání textury
            this.course.start.y - 20, // Posun pro zarovnání textury
            40, // Šířka textury
            40  // Výška textury
        );

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
            } else if (obs.type === 'rect') {
                this.ctx.save(); // Uloží aktuální stav kontextu

                // Přesuneme střed rotace na střed překážky
                const centerX = obs.x + obs.width / 2;
                const centerY = obs.y + obs.height / 2;
                this.ctx.translate(centerX, centerY);

                // Aplikujeme rotaci
                this.ctx.rotate((obs.rotation * Math.PI) / 180);

                // Vykreslíme překážku s posunem zpět na její pozici
                this.ctx.drawImage(
                    this.obstacleTexture,
                    -obs.width / 2, // Posun na střed
                    -obs.height / 2, // Posun na střed
                    obs.width,
                    obs.height
                );

                this.ctx.restore(); // Obnoví původní stav kontextu
            }
        });

        // Vykreslení jamky
        const holeSizeMultiplier = 0.6;
        this.ctx.drawImage(
            this.holeTexture,
            this.course.hole.x - (this.course.hole.radius * holeSizeMultiplier),
            this.course.hole.y - (this.course.hole.radius * holeSizeMultiplier),
            this.course.hole.radius * 2 * holeSizeMultiplier,
            this.course.hole.radius * 2 * holeSizeMultiplier
        );

        // Vykreslení vlaječky nad jamkou
        this.ctx.drawImage(
            this.flagTexture,
            this.course.hole.x - (this.course.hole.radius / 2 - holeSizeMultiplier), // Posun vlaječky na střed jamky
            this.course.hole.y - this.course.hole.radius * 3, // Posun vlaječky nahoru
            this.course.hole.radius, // Šířka vlaječky
            this.course.hole.radius * 3 // Výška vlaječky
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
        console.log('Game stopped.');
    }

    reset() {
        this.stopGame();
        this.commandQueue = [];
        this.commandNumber = 0;
        this.currentCommandNumber = 0;
        this.path = [];
        this.allPaths = [];

        // Vrátit míček na startovní pozici
        this.ball.x = this.course.start.x;
        this.ball.y = this.course.start.y;
        this.ball.vx = 0;
        this.ball.vy = 0;

        this.render();
    }

    resetBlocklyWorkspace() {
        if (this.blocklyWorkspace) {
            this.blocklyWorkspace.clear(); // Vymaže všechny bloky
        } else {
            console.warn('Blockly workspace is not initialized.');
        }
    }

    updateResultsTable() {
        const resultsTableBody = document.querySelector('#results-table tbody');
        resultsTableBody.innerHTML = ''; // Vyčistit tabulku

        Object.keys(this.results).forEach(levelIndex => {
            const levelName = this.levels[levelIndex].name;
            const moves = this.results[levelIndex];

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${levelName}</td>
                <td>${moves}</td>
            `;
            resultsTableBody.appendChild(row);
        });
    }
}
