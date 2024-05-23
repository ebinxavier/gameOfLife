import { Application, Graphics, Point, Renderer } from "pixi.js";

const dotSize = 20;
const border = 1;
const frameDelay = 200;
const dotColor = "white";
let app: Application<Renderer>;
const dotMatrix: Graphics[][] = [];

const quantizeCoordinate = (coordinate: number) => {
  return Math.floor(coordinate / dotSize) * dotSize;
};

const addDot = (x: number, y: number) => {
  const qX = quantizeCoordinate(x);
  const qY = quantizeCoordinate(y);
  const indexX = Math.floor(x / dotSize);
  const indexY = Math.floor(y / dotSize);

  if (dotMatrix[indexX]?.[indexY]) {
    dotMatrix[indexX]?.[indexY].destroy();
    delete dotMatrix[indexX]?.[indexY];
    return;
  }

  const dot = new Graphics();
  dot.rect(qX, qY, dotSize - border, dotSize - border);
  dot.fill(dotColor);
  app.stage.addChild(dot);

  if (!dotMatrix[indexX]) dotMatrix[indexX] = [];
  dotMatrix[indexX][indexY] = dot;
};

export const initialize = async () => {
  app = new Application();
  // Intialize the application.
  await app.init({ background: "black", resizeTo: window });
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.addEventListener("pointerdown", (e) => {
    addDot(e.global.x, e.global.y);
  });
  document.body.appendChild(app.canvas);
};

const getNeighborCount = (x: number, y: number) => {
  return (
    (dotMatrix[x - 1]?.[y - 1] ? 1 : 0) +
    (dotMatrix[x]?.[y - 1] ? 1 : 0) +
    (dotMatrix[x + 1]?.[y - 1] ? 1 : 0) +
    (dotMatrix[x - 1]?.[y] ? 1 : 0) +
    (dotMatrix[x + 1]?.[y] ? 1 : 0) +
    (dotMatrix[x - 1]?.[y + 1] ? 1 : 0) +
    (dotMatrix[x]?.[y + 1] ? 1 : 0) +
    (dotMatrix[x + 1]?.[y + 1] ? 1 : 0)
  );
};

/*
  1. Any live cell with fewer than two live neighbors dies, as if by underpopulation.
  2. Any live cell with two or three live neighbors lives on to the next generation.
  3. Any live cell with more than three live neighbors dies, as if by overpopulation.
  4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
*/

let intervalId: number;
const startGame = () => {
  // @ts-expect-error the next line is a native dom manipulation
  document.getElementById("control").className = "button paused";

  intervalId = setInterval(() => {
    let hasLiveCells = false;
    const markedForDeletion = [];
    const markedForCreation: Point[] = [];
    const w = window.innerWidth / dotSize;
    const h = window.innerHeight / dotSize;
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        const n = getNeighborCount(i, j);
        if (dotMatrix[i]?.[j]) {
          hasLiveCells = true;
          // Check for destruction
          if (n < 2 || n > 3) {
            markedForDeletion.push({
              coordinate: new Point(i, j),
              dot: dotMatrix[i]?.[j],
            });
          }
          console.log("Neighbors:", n);
        } else if (n === 3) {
          markedForCreation.push(new Point(i * dotSize, j * dotSize));
        }
      }
    }

    markedForDeletion.forEach((e) => {
      e.dot.destroy();
      delete dotMatrix[e.coordinate.x][e.coordinate.y];
    });
    markedForCreation.forEach((e) => {
      addDot(e.x, e.y);
    });
    if (!hasLiveCells) pauseGame();
  }, frameDelay);
};

const pauseGame = () => {
  // @ts-expect-error the next line is a native dom manipulation
  document.getElementById("control").className = "button";
  clearInterval(intervalId);
  intervalId = 0;
};

export const startStopGame = () => {
  if (intervalId) pauseGame();
  else startGame();
};
