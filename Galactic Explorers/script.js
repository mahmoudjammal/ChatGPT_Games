const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

// Define constants
const WIDTH = 800;
const HEIGHT = 600;
const MAX_RESOURCES = 15;
const MAX_EVENTS = 8;
const PLAYER_SPEED = 3;
const COMPUTER_SPEED = 3;

// Define colors
const BLACK = "#000";
const WHITE = "#fff";
const RED = "#f00";
const BLUE = "#00f";
const GREEN = "#0f0";

// Create player object
const player = {
  x: 50,
  y: 50,
  width: 30,
  height: 30,
  color: WHITE,
  resourceCount: 0,
  score: 0,
  wins: 0,
};

// Create computer object starting from the upper right corner
const computer = {
  x: WIDTH - 50, // Adjusted to start from the upper right corner
  y: 50,
  width: 30,
  height: 30,
  color: GREEN,
  resourceCount: 0,
  score: 0,
  wins: 0,
};

// Create resource cards array with more initial resources
let resources = createSquares(MAX_RESOURCES, RED);

// Create event cards array with more initial events
let events = createSquares(MAX_EVENTS, BLUE);

// Function to draw objects on the canvas with boundaries
function drawObjectWithBoundaries(obj) {
  // Check boundaries
  obj.x = Math.max(0, Math.min(obj.x, WIDTH - obj.width));
  obj.y = Math.max(0, Math.min(obj.y, HEIGHT - obj.height));
  // Draw object
  if (!obj.collected) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  }
}

// Function to create an array of squares with random positions
function createSquares(count, color) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * (WIDTH - 30),
    y: Math.random() * (HEIGHT - 30),
    width: 30,
    height: 30,
    color,
    collected: false,
  }));
}

// Function to check collisions
function checkCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Find the nearest available square (red or blue) for the computer to move towards
function findNearestSquare(obj, squares) {
  let minDistance = Infinity;
  let nearestSquare = null;

  squares.forEach((square) => {
    const deltaX = square.x - obj.x;
    const deltaY = square.y - obj.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < minDistance && !square.collected) {
      minDistance = distance;
      nearestSquare = square;
    }
  });

  return nearestSquare;
}

// Function to handle play again button click
function playAgainClick() {
  resetGame();
  hideButtons();
  clearGameOverText();
  gameLoop();
}

// Function to reset game state
function resetGame() {
  player.score = 0;
  computer.score = 0;
  player.resourceCount = 0;
  computer.resourceCount = 0;
  player.x = 50;
  player.y = 50;
  computer.x = WIDTH - 50;
  computer.y = 50;
  resources = createSquares(MAX_RESOURCES, RED);
  events = createSquares(MAX_EVENTS, BLUE);
}

// Function to hide buttons
function hideButtons() {
  document.getElementById("buttons").style.display = "none";
}

// Function to clear "Game Over! Winner: ..." text
function clearGameOverText() {
  document.getElementById("game-over").innerText = "";
}

// Main game loop
function gameLoop() {
  // Clear the canvas
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Move player based on keyboard input
  if (keys["ArrowLeft"]) player.x -= PLAYER_SPEED;
  if (keys["ArrowRight"]) player.x += PLAYER_SPEED;
  if (keys["ArrowUp"]) player.y -= PLAYER_SPEED;
  if (keys["ArrowDown"]) player.y += PLAYER_SPEED;

  // Move computer towards the nearest available square (red or blue)
  const nearestResource = findNearestSquare(computer, resources);
  const nearestEvent = findNearestSquare(computer, events);

  if (nearestResource || nearestEvent) {
    const nearestSquare = nearestResource || nearestEvent;
    const deltaX = nearestSquare.x - computer.x;
    const deltaY = nearestSquare.y - computer.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 0) {
      const moveX = (deltaX / distance) * COMPUTER_SPEED;
      const moveY = (deltaY / distance) * COMPUTER_SPEED;

      computer.x += moveX;
      computer.y += moveY;
    }
  }

  // Draw player with boundaries
  drawObjectWithBoundaries(player);

  // Draw computer with boundaries
  drawObjectWithBoundaries(computer);

  // Draw resources
  resources.forEach((resource) => {
    drawObjectWithBoundaries(resource);
    // Check for collisions with resources
    if (!resource.collected && checkCollision(player, resource)) {
      player.resourceCount += 1;
      player.score += 10; // Increase score when collecting resources
      resource.collected = true;
      console.log(`Player collected a resource! Total resources: ${player.resourceCount}, Score: ${player.score}`);
    }
    // Check for collisions with computer
    if (!resource.collected && checkCollision(computer, resource)) {
      computer.resourceCount += 1;
      computer.score += 10; // Increase score when computer collects resources
      resource.collected = true;
      console.log(`Computer collected a resource! Total resources: ${computer.resourceCount}, Score: ${computer.score}`);
    }
  });

  // Draw events
  events.forEach((event) => {
    drawObjectWithBoundaries(event);
    // Check for collisions with events
    if (!event.collected && checkCollision(player, event)) {
      player.score += 20; // Increase score when triggering events
      event.collected = true;
      console.log(`Player triggered an event! Score: ${player.score}`);
    }
    // Check for collisions with computer
    if (!event.collected && checkCollision(computer, event)) {
      computer.score += 20; // Increase score when computer triggers events
      event.collected = true;
      console.log(`Computer triggered an event! Score: ${computer.score}`);
    }
  });

  // Draw scores
  ctx.fillStyle = WHITE;
  ctx.font = "18px Arial";
  ctx.fillText(`Player Score: ${player.score} Wins: ${player.wins}`, 10, 20);
  ctx.fillText(`Computer Score: ${computer.score} Wins: ${computer.wins}`, WIDTH - 235, 20); // Adjusted position for computer score

  // Check for game end
  if (player.score >= 200 || computer.score >= 200) {
    // Display the winner
    const winner = player.score > computer.score ? "Player" : "Computer";
    document.getElementById("game-over").innerText = `Game Over! Winner: ${winner}`;
    // Update win count
    if (winner === "Player") {
      player.wins++;
    } else {
      computer.wins++;
    }
    // Display buttons
    document.getElementById("buttons").style.display = "block";
    return;
  }

  // Check if all squares are collected
  const allSquaresCollected = resources.every(resource => resource.collected) && events.every(event => event.collected);
  if (allSquaresCollected) {
    // Check for a tie
    if (player.score === computer.score) {
      const message = "It's a Tie!";
      // Calculate text width and height
      const textWidth = ctx.measureText(message).width;
      const textHeight = 24; // Assuming font size 24

      // Draw the message in the middle of the canvas
      ctx.fillStyle = WHITE;
      ctx.fillText(message, (WIDTH - textWidth) / 2, (HEIGHT - textHeight) / 2);

      // Display buttons for playing again
      document.getElementById("buttons").style.display = "block";
      return;
    }

    // Display the winner when all squares are collected
    const winner = player.score > computer.score ? "Player" : "Computer";
    const message = `All galaxies colonized! Winner: ${winner}`;

    // Calculate text width and height
    const textWidth = ctx.measureText(message).width;
    const textHeight = 18; // Assuming font size 18

    // Draw the message in the middle of the canvas
    ctx.fillText(message, (WIDTH - textWidth) / 2, (HEIGHT - textHeight) / 2);

    // Update win count
    if (winner === "Player") {
      player.wins++;
    } else {
      computer.wins++;
    }

    // Display buttons
    document.getElementById("buttons").style.display = "block";
    return;
  }

  // Request the next animation frame
  requestAnimationFrame(gameLoop);
}

// Keyboard input handling
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Set up the canvas size
canvas.width = WIDTH;
canvas.height = HEIGHT;

// Set up button click event listener
document.getElementById("play-again").addEventListener("click", playAgainClick);

// Start the game loop
gameLoop();