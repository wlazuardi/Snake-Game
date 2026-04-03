import {
  GRID_SIZE,
  TICK_MS,
  createGameState,
  stepGame,
  togglePause,
} from "./snake-logic.mjs";

const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const directionButtons = document.querySelectorAll("[data-direction]");

let state = createGameState();
let queuedDirection = null;

function buildBoard() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    fragment.appendChild(cell);
  }

  boardElement.replaceChildren(fragment);
}

function getCellIndex(position) {
  return position.y * GRID_SIZE + position.x;
}

function render() {
  const cells = boardElement.children;

  for (const cell of cells) {
    cell.className = "cell";
  }

  state.snake.forEach((segment) => {
    const cell = cells[getCellIndex(segment)];
    if (cell) {
      cell.classList.add("cell-snake");
    }
  });

  if (state.food) {
    const foodCell = cells[getCellIndex(state.food)];
    if (foodCell) {
      foodCell.classList.add("cell-food");
    }
  }

  scoreElement.textContent = String(state.score);

  if (state.isGameOver) {
    statusElement.textContent = "Game over. Press restart to play again.";
  } else if (state.isPaused) {
    statusElement.textContent = "Paused. Press pause or Space to continue.";
  } else {
    statusElement.textContent = "Use arrow keys or WASD to steer.";
  }

  pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
}

function queueDirection(direction) {
  queuedDirection = direction;
}

function restart() {
  state = createGameState();
  queuedDirection = null;
  render();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const keyToDirection = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
  };

  if (key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  const direction = keyToDirection[key];
  if (direction) {
    event.preventDefault();
    queueDirection(direction);
  }
});

pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartButton.addEventListener("click", restart);

directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    queueDirection(button.dataset.direction);
  });
});

buildBoard();
render();

window.setInterval(() => {
  state = stepGame(state, queuedDirection);
  queuedDirection = null;
  render();
}, TICK_MS);
