export const GRID_SIZE = 16;
export const TICK_MS = 140;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const STARTING_SNAKE = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
  { x: 6, y: 8 },
];

export function createGameState(randomFn = Math.random) {
  const snake = STARTING_SNAKE.map((segment) => ({ ...segment }));

  return {
    gridSize: GRID_SIZE,
    snake,
    direction: "right",
    food: getRandomFoodPosition(snake, GRID_SIZE, randomFn),
    score: 0,
    isGameOver: false,
    isPaused: false,
  };
}

export function getRandomFoodPosition(snake, gridSize, randomFn = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const freeCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * freeCells.length);
  return freeCells[index];
}

export function isOppositeDirection(currentDirection, nextDirection) {
  if (!nextDirection) {
    return false;
  }

  const currentVector = DIRECTIONS[currentDirection];
  const nextVector = DIRECTIONS[nextDirection];

  return (
    currentVector.x + nextVector.x === 0 &&
    currentVector.y + nextVector.y === 0
  );
}

export function stepGame(state, requestedDirection, randomFn = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction =
    requestedDirection && !isOppositeDirection(state.direction, requestedDirection)
      ? requestedDirection
      : state.direction;

  const head = state.snake[0];
  const movement = DIRECTIONS[direction];
  const nextHead = {
    x: head.x + movement.x,
    y: head.y + movement.y,
  };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize;

  const willEatFood =
    state.food &&
    nextHead.x === state.food.x &&
    nextHead.y === state.food.y;

  const bodyToCheck = willEatFood ? state.snake : state.snake.slice(0, -1);
  const hitSelf = bodyToCheck.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
  );

  if (hitWall || hitSelf) {
    return {
      ...state,
      direction,
      isGameOver: true,
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!willEatFood) {
    nextSnake.pop();
  }

  return {
    ...state,
    direction,
    snake: nextSnake,
    food: willEatFood
      ? getRandomFoodPosition(nextSnake, state.gridSize, randomFn)
      : state.food,
    score: willEatFood ? state.score + 1 : state.score,
  };
}

export function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused,
  };
}
