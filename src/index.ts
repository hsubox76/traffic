const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 200;

const CAR_WIDTH = 10;
const CAR_LENGTH = 20;

const CAR_PAD = 50;

const LANE_PAD = 5;
const LANE_WIDTH = CAR_WIDTH + LANE_PAD * 2;

const COLLISION_PAD = 10;

let carId = 0;

interface CarOptions {
  color?: string;
  preferredSpeed?: number;
}

class Car {
  public speed: number = 5;
  public preferredSpeed: number = 5;
  public color: string = 'blue';
  public id: number;
  constructor(public x: number, public y: number, options?: CarOptions) {
    this.id = carId++;
    if (options?.color) {
      this.color = options.color;
    }
    if (options?.preferredSpeed) {
      this.preferredSpeed = options.preferredSpeed;
    }
    this.speed = this.preferredSpeed;
  }
  step(cars: Car[]) {
    for (const otherCar of cars) {
      if (otherCar.id !== this.id) {
        const stepsToCollide = this.willCollide(otherCar, 3);
        if (stepsToCollide >= 0) {
          if (otherCar.x > this.x) {
            this.brake();
            this.color = 'red';
          }
        }
      }
    }
    this.x = this.x + this.speed;
  }
  brake() {
    this.speed = this.speed - 1;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, CAR_LENGTH, CAR_WIDTH);
  }
  /**
   * Detect collision box overlap in next step.
   */
  getCollisionBox(steps: number = 1) {
    return {
        left: this.x + this.speed * steps - COLLISION_PAD,
        right: this.x + this.speed * steps + CAR_LENGTH + COLLISION_PAD,
        top: this.y - COLLISION_PAD,
        bottom: this.y + CAR_WIDTH + COLLISION_PAD,
    }
  }
  willCollide(otherCar: Car, maxSteps: number = 3): number {
    for (let i = 0; i < maxSteps; i++) {
      const thisBox = this.getCollisionBox(i);
      const otherBox = otherCar.getCollisionBox(i);
      if (thisBox.left < otherBox.right &&
        thisBox.right > otherBox.left &&
        thisBox.top < otherBox.bottom &&
        thisBox.bottom > otherBox.top) {
         return i;
     }
    }
    return -1;
  }
}

class Lane {
  public cars: Car[] = [];
  constructor(public y: number) {}
  addCar(options?: CarOptions) {
    const lastCar = this.cars[this.cars.length - 1];
    const x = lastCar ? lastCar.x - CAR_LENGTH - CAR_PAD : 0;
    const car = new Car(x, this.y + LANE_PAD, options);
    this.cars.push(car);
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, this.y);
    ctx.lineTo(CANVAS_WIDTH, this.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, this.y + LANE_WIDTH);
    ctx.lineTo(CANVAS_WIDTH, this.y + LANE_WIDTH);
    ctx.stroke();
    for (const car of this.cars) {
      car.step(this.cars);
      car.draw(ctx);
    }
  }
}

const canvasEl = document.createElement('canvas');
const ctx = canvasEl.getContext('2d');
canvasEl.width = CANVAS_WIDTH;
canvasEl.height = CANVAS_HEIGHT;

document.body.appendChild(canvasEl);

const lanes = [new Lane(0)];
lanes[0].addCar();
lanes[0].addCar({ preferredSpeed: 7 });

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ccc';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawLanes(ctx: CanvasRenderingContext2D) {
  for (const lane of lanes) {
    lane.draw(ctx);
  }
}

let count = 0;
const MAX_FRAME = 50

function renderFrame() {
  count++;
  if (count > MAX_FRAME) return;
  drawBackground(ctx);
  drawLanes(ctx);
  requestAnimationFrame(renderFrame);
}

requestAnimationFrame(renderFrame);