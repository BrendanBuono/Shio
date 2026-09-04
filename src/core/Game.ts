import type { World } from '../components/PhysicsComponent';
import type { ActorDestroyedEvent } from '../events/ActorEvents';
import type { CollisionEvent } from '../events/CollisionEvent';
import { EventManager } from '../events/EventManager';
import { EventType } from '../events/EventType';
import { GamePausedEvent } from '../events/GamePausedEvent';
import { CollisionSystem } from '../physics/CollisionSystem';
import { GameLoop } from './GameLoop';
import type { GameObject } from './GameObject';
import { Key, KeyboardInput } from './KeyboardInput';

export interface GameOptions {
  /** Fixed simulation step in seconds. Defaults to 1/60. */
  stepSeconds?: number;
  /** Time allowed for queued events per step, in milliseconds. Defaults to 4. */
  eventBudgetMillis?: number;
  /** Show the frame rate and pause banner. Defaults to true. */
  showHud?: boolean;
}

/** Owns the canvas, the input, the event queue, the objects, and the loop that ties them together. */
export class Game implements World {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly events = new EventManager();
  readonly input = new KeyboardInput();
  readonly objects: GameObject[] = [];
  readonly collisions = new CollisionSystem();
  paused = false;
  width: number;
  height: number;
  /** Height of the ground band at the bottom of the world. Objects stand on top of it. */
  groundHeight = 0;
  /** Smoothed frames per second, updated every render. */
  fps = 0;
  private readonly loop: GameLoop;
  private readonly eventBudgetMillis: number;
  private readonly showHud: boolean;

  constructor(canvas: HTMLCanvasElement, options: GameOptions = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get a 2D rendering context from the canvas');
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.eventBudgetMillis = options.eventBudgetMillis ?? 4;
    this.showHud = options.showHud ?? true;
    this.loop = new GameLoop({
      update: (step) => this.step(step),
      render: (alpha, frameSeconds) => this.render(alpha, frameSeconds),
      ...(options.stepSeconds !== undefined ? { stepSeconds: options.stepSeconds } : {}),
    });
    this.events.register(this, this.onGamePaused, EventType.GamePaused);
    this.events.register(this, this.onCollision, EventType.Collision);
    this.events.register(this, this.onActorDestroyed, EventType.ActorDestroyed);
  }

  get isRunning(): boolean {
    return this.loop.isRunning;
  }

  get floorY(): number {
    return this.height - this.groundHeight;
  }

  add(object: GameObject): this {
    this.objects.push(object);
    return this;
  }

  remove(object: GameObject): boolean {
    const index = this.objects.indexOf(object);
    if (index === -1) return false;
    this.objects.splice(index, 1);
    return true;
  }

  /** Attaches input, sizes the canvas to the window and starts the loop. */
  start(): void {
    this.input.attach(window);
    this.resizeToWindow();
    window.addEventListener('resize', this.resizeToWindow);
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
    window.removeEventListener('resize', this.resizeToWindow);
    this.input.detach();
  }

  resize(width: number, height: number): void {
    // Setting width or height resets every context property, so nothing drawn
    // relies on context state persisting between frames.
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
  }

  /** One fixed simulation step. Public so tests and tools can drive the game without a loop. */
  step(stepSeconds: number): void {
    // Pause is checked before the paused gate, so Escape also unpauses.
    if (this.input.wasPressed(Key.Escape)) {
      this.events.queue(new GamePausedEvent());
    }
    this.events.update(this.eventBudgetMillis);

    if (!this.paused) {
      // Snapshot so handlers may add or remove objects mid-step without upsetting iteration.
      const objects = [...this.objects];
      for (const object of objects) {
        object.update(stepSeconds);
      }
      this.collisions.resolve(objects, this.events);
    }
    this.input.flush();
  }

  render(alpha: number, frameSeconds: number): void {
    if (frameSeconds > 0) {
      const instantaneous = 1 / frameSeconds;
      this.fps = this.fps === 0 ? instantaneous : this.fps * 0.9 + instantaneous * 0.1;
    }
    const { ctx } = this;
    // Resizing resets this, so it is set every frame. Keeps scaled pixel art crisp.
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.width, this.height);
    for (const object of this.objects) {
      object.draw(ctx, alpha);
    }
    if (this.showHud) this.drawHud();
  }

  private drawHud(): void {
    const { ctx } = this;
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(`${Math.round(this.fps)} fps`, 8, 8);
    if (this.paused) {
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', this.width / 2, this.height / 2 - 16);
      ctx.textAlign = 'start';
    }
  }

  private onGamePaused(this: Game): void {
    this.paused = !this.paused;
  }

  private onCollision(this: Game, event: CollisionEvent): void {
    event.a.onCollision(event);
    event.b.onCollision(event);
  }

  private onActorDestroyed(this: Game, event: ActorDestroyedEvent): void {
    this.remove(event.actor);
  }

  private readonly resizeToWindow = (): void => {
    this.resize(window.innerWidth, window.innerHeight);
  };
}
