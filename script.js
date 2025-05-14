const canvas = document.querySelector("#ping-pong");
const context = canvas.getContext("2d");

const startBtn = document.querySelector(".start-btn");
const pauseBtn = document.querySelector(".pause-btn");
const restartBtn = document.querySelector(".restart-btn");

let gameRunning = false;
let animationId;
const winningScore = 5;
let isGameOver = false;

// CREATE USER PADDLE (Player 1)
const user = {
    x: 0,
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "red",
    score: 0
};

// CREATE COMPUTER PADDLE (Player 2 controlled by mouse)
const computer = {
    x: canvas.width - 10,
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "black",
    score: 0
};

// CREATE THE BALL
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "white"
};

// CREATE THE NET
const net = {
    x: canvas.width / 2 - 1,
    y: 0,
    width: 2,
    height: 10,
    color: "white"
};

// Restart the game
restartBtn.addEventListener("click", () => {
    resetGame();
    render();
});

// LOAD RENDER ON START
addEventListener("load", () => {
    render();
});

// DRAW NET FUNCTION
function drawNet() {
    const netWidth = 4;
    const netSpacing = 15;

    for (let i = 0; i <= canvas.height; i += netSpacing) {
        drawRectangle(net.x, net.y + i, netWidth, net.height, net.color);
    }
}

// DRAW RECTANGLE FUNCTION
function drawRectangle(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

// DRAW CIRCLE FUNCTION
function drawCircle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

// DRAW TEXT FUNCTION
function drawText(text, x, y, color, size = "45px") {
    context.fillStyle = color;
    context.font = `${size} fantasy`;
    context.fillText(text, x, y);
}

// RENDER GAME FUNCTION
function render() {
    // CLEAR THE CANVAS
    drawRectangle(0, 0, canvas.width, canvas.height, "green");

    // DRAW THE NET
    drawNet();

    // DRAW THE SCORE
    drawText(user.score, canvas.width / 4, canvas.height / 5, "white");
    drawText(computer.score, (3 * canvas.width) / 4, canvas.height / 5, "white");


    // DRAW THE USER AND COMPUTER PADDLES
    drawRectangle(user.x, user.y, user.width, user.height, user.color);
    drawRectangle(computer.x, computer.y, computer.width, computer.height, computer.color);

    // DRAW THE BALL
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    // DRAW THE WHITE LINE IN THE MIDDLE
    drawRectangle(net.x, net.y, net.width, canvas.height, net.color);
}

// CONTROL BOTH PADDLES USING MOUSE
canvas.addEventListener("mousemove", moveBothPaddles);

function moveBothPaddles(evt) {
    if (isGameOver) return;

    let rectangle = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rectangle.top;
    let mouseX = evt.clientX - rectangle.left;

    if (mouseX < canvas.width / 2) {
        user.y = mouseY - user.height / 2;
    } else {
        computer.y = mouseY - computer.height / 2;
    }
}

// COLLISION DETECTION FUNCTION
function collision(b, p) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

// RESET BALL FUNCTION
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.velocityX = -ball.velocityX;
}

// RESET GAME FUNCTION
function resetGame() {
    user.score = 0;
    computer.score = 0;
    ball.speed = 5;
    resetBall();
    isGameOver = false;
    cancelAnimationFrame(animationId); // Stop the current animation
    render();
}

// CHECK IF GAME IS OVER
function checkGameOver() {
    if (user.score === winningScore || computer.score === winningScore) {
        isGameOver = true;
        gameRunning = false;
        cancelAnimationFrame(animationId);
        renderGameOverMessage();
        return true;
    }
    return false;
}

// RENDER GAME OVER MESSAGE
function renderGameOverMessage() {
    const winner = user.score === winningScore ? "Player 1" : "Player 2";
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawText(`${winner} Wins!`, canvas.width / 6, canvas.height / 2 - 50, "yellow", "60px");
    drawText("Game Over", canvas.width / 4, canvas.height / 2 + 50, "white", "50px");
    drawText("Game will restart in 3 seconds", canvas.width / 4, canvas.height / 2 + 120, "white", "30px");
    setTimeout(resetGame, 3000); // Reset the game after 3 seconds
}

// UPDATE FUNCTION
function update() {
    if (isGameOver) return;

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Ball hits top or bottom of the canvas
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }

    // Ball hits left or right of the canvas
    if (ball.x - ball.radius < 0) {
        computer.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        resetBall();
    }

    // Determine if the ball hits the user or computer paddle
    let player = (ball.x < canvas.width / 2) ? user : computer;

    if (collision(ball, player)) {
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angleRad = collidePoint * Math.PI / 4;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;

        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.5;
    }

    // Check if game is over
    checkGameOver();

    // Render the game
    render();

    // Update the animation
    animationId = requestAnimationFrame(update);
}

// START AND PAUSE BUTTONS
startBtn.addEventListener("click", () => {
    if (!gameRunning && !isGameOver) {
        gameRunning = true;
        update();
    }
});

pauseBtn.addEventListener("click", () => {
    gameRunning = false;
    cancelAnimationFrame(animationId); // Pause the game
});
