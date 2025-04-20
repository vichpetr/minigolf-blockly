class GolfGame {
    constructor(canvasId, course) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.course = course;
        this.ball = {
            x: course.start.x,
            y: course.start.y,
            vx: 0,
            vy: 0,
            radius: 10
        };
        this.path = [];
        this.isRunning = false;
    }

    init() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.render();
    }

    applyForce(power, angle) {
        this.isRunning = true;
        this.path = []; // Resetovat trajektorii
        console.log(`input values power: ${power} and angle: ${angle}`);
        const radians = angle * Math.PI / 180;
        this.ball.vx += Math.cos(radians) * power * 0.1;
        this.ball.vy += Math.sin(radians) * power * 0.1;
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
        
        // Odraz s 80% zachováním rychlosti
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
        
        // Určení strany kolize
        const overlapX = Math.min(
            Math.abs(ballNextX + this.ball.radius - obs.x),
            Math.abs(ballNextX - this.ball.radius - (obs.x + obs.width))
        );
        
        const overlapY = Math.min(
            Math.abs(ballNextY + this.ball.radius - obs.y),
            Math.abs(ballNextY - this.ball.radius - (obs.y + obs.height))
        );
        
        // Odraz podle dominující osy
        if (overlapX < overlapY) {
            this.ball.vx *= -0.8;
        } else {
            this.ball.vy *= -0.8;
        }
    }
}

checkBoundaries() {
    const canvas = this.canvas;
    
    // Reset při vypadnutí z hřiště
    if (this.ball.x < -100 || 
        this.ball.x > canvas.width + 100 ||
        this.ball.y < -100 || 
        this.ball.y > canvas.height + 100) {
        this.reset();
        return;
    }
    
    // Odraz od okrajů
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
            return
        };

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        this.ball.vx *= 0.98;
        this.ball.vy *= 0.98;
        
        this.path.push({x: this.ball.x, y: this.ball.y});
        
        this.checkCollisions();
        this.render();
       
       if (Math.hypot(this.ball.vx, this.ball.vy) > 0.1) {
           setTimeout(() => this.gameLoop(), 50);
       } else {
           this.stopGame();
       }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Vykreslení trajektorie
        if (this.path.length > 1) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'red';
            this.ctx.setLineDash([5, 5]);
            this.ctx.moveTo(this.path[0].x, this.path[0].y);
            
            for (let i = 1; i < this.path.length; i++) {
                this.ctx.lineTo(this.path[i].x, this.path[i].y);
            }
            
            this.ctx.stroke();
            this.ctx.setLineDash([]); // Resetovat čáru
        }
        
        // Překážky
        this.course.obstacles.forEach(obs => {
            if (obs.type === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#666';
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = '#444';
                this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            }
        });
        
        // Jamka
        this.ctx.beginPath();
        this.ctx.arc(this.course.hole.x, this.course.hole.y, 
                    this.course.hole.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        
        // Míček
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'red';
        this.ctx.fill();
    }

    stopGame() {
        this.isRunning = false;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }

    reset() {
        this.stopGame();
        this.path = [];
        this.ball.x = this.course.start.x;
        this.ball.y = this.course.start.y;
        this.render();
    }
}
