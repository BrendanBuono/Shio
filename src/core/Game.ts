import type { World } from '../components/PhysicsComponent';
import type { ActorDestroyedEvent } from '../events/ActorEvents';
import type { CollisionEvent } from '../events/CollisionEvent';
import { EventManager } from '../events/EventManager';
import { EventType } from '../events/EventType';
import { GamePausedEvent } from '../events/GamePausedEvent';
import type { Rect } from '../physics/Aabb';
import { CollisionSystem } from '../physics/CollisionSystem';
import { Camera } from './Camera';
import { GameLoop } from './GameLoop';
import type { GameObject } from './GameObject';
import { Key, KeyboardInput } from './KeyboardInput';
import { SoundPlayer } from './SoundPlayer';

export interface GameOptions {
  /** Fixed simulation step in seconds. Defaults to 1/60. */
  stepSeconds?: number;
  /** Time allowed for queued events per step, in milliseconds. Defaults to 4. */
  eventBudgetMillis?: number;
  /** Show the frame rate and pause banner. Defaults to true. */
  showHud?: boolean;
}

/** Owns the canvas, the input, the event queue, the objects, and the loop that ties them together. */
export class Game {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly events = new EventManager();
  readonly input = new KeyboardInput();
  readonly sound = new SoundPlayer();
  readonly camera = new Camera();
  readonly objects: GameObject[] = [];
  readonly collisions = new CollisionSystem();
  /** Live view of the world's extent for physics and drawing. Width comes from the level, height from the viewport. */
  readonly world: World;
  paused = false;
  /** Viewport size in pixels, which is the canvas size. */
  width: number;
  height: number;
  /** World width in pixels. Null means the world is exactly one viewport wide. */
  levelWidth: number | null = null;
  /** Height of the ground band at the bottom of the world. Objects stand on top of it. */
  groundHeight = 0;
  /** Smoothed frames per second, updated every render. */
  fps = 0;
  private readonly loop: GameLoop;
  private readonly eventBudgetMillis: number;
  private readonly showHud: boolean;
  private cameraTarget: GameObject | null = null;

  constructor(canvas: HTMLCanvasElement, options: GameOptions = {}) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get a 2D rendering context from the canvas');
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.eventBudgetMillis = options.eventBudgetMillis ?? 4;
    this.showHud = options.showHud ?? true;
    const game = this;
    this.world = {
      get width() {
        return game.worldWidth;
      },
      get height() {
        return game.height;
      },
      get floorY() {
        return game.floorY;
      },
      get viewport() {
        return game.camera.view(game);
      },
    };
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

  get worldWidth(): number {
    return this.levelWidth ?? this.width;
  }

  get worldBounds(): Rect {
    return { x: 0, y: 0, width: this.worldWidth, height: this.height };
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

  /** Attaches input and sound, sizes the canvas to the window and starts the loop. */
  start(): void {
    this.input.attach(window);
    this.sound.attach(window);
    this.resizeToWindow();
    window.addEventListener('resize', this.resizeToWindow);
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
    window.removeEventListener('resize', this.resizeToWindow);
    this.input.detach();
    this.sound.detach();
  }

  resize(width: number, height: number): void {
    // Setting width or height resets every context property, so nothing drawn
    // relies on context state persisting between frames.
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    this.camera.clamp(this, this.worldBounds);
  }

  /** Makes the camera follow an object, starting centred on it. */
  follow(target: GameObject | null): void {
    this.cameraTarget = target;
    if (target) this.camera.snapTo(target.bounds, this, this.worldBounds);
  }

  /** One fixed simulation step. Public so tests and tools can drive the game without a loop. */
  step(stepSeconds: number): void {
    // Pause is checked before the paused gate, so Escape also unpauses.
    if (this.input.wasPressed(Key.Escape)) {
      this.events.queue(new GamePausedEvent());
    }
    if (this.input.wasPressed(Key.Mute)) {
      this.sound.toggleMute();
    }
    this.events.update(this.eventBudgetMillis);

    if (!this.paused) {
      // Snapshot so handlers may add or remove objects mid-step without upsetting iteration.
      const objects = [...this.objects];
      for (const object of objects) {
        object.update(stepSeconds);
      }
      this.collisions.resolve(objects, this.events);
      for (const object of objects) object.endStep();
    }
    this.input.flush();
  }

  render(alpha: number, frameSeconds: number): void {
    if (frameSeconds > 0) {
      const instantaneous = 1 / frameSeconds;
      this.fps = this.fps === 0 ? instantaneous : this.fps * 0.9 + instantaneous * 0.1;
    }
    const { ctx } = this;
    if (this.cameraTarget) {
      const p = this.cameraTarget.renderPosition(alpha);
      this.camera.follow({ x: p.x, y: p.y, width: this.cameraTarget.size.x, height: this.cameraTarget.size.y }, this, this.worldBounds, frameSeconds);
    }
    // Resizing resets this, so it is set every frame. Keeps scaled pixel art crisp.
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    // Subtracting from zero avoids a negative zero when the camera sits at the origin.
    ctx.translate(0 - Math.round(this.camera.x), 0 - Math.round(this.camera.y));
    for (const object of this.objects) {
      if (!object.screenSpace) object.draw(ctx, alpha);
    }
    ctx.restore();
    for (const object of this.objects) {
      if (object.screenSpace) object.draw(ctx, alpha);
    }
    if (this.showHud) this.drawHud();
  }

  private drawHud(): void {
    const { ctx } = this;
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(`${Math.round(this.fps)} fps${this.sound.muted ? '  muted' : ''}`, 8, 8);
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
