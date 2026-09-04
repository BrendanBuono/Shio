export interface GameLoopOptions {
  /** Advances the simulation by exactly `stepSeconds`. Called zero or more times per frame. */
  update: (stepSeconds: number) => void;
  /**
   * Draws the current state. `alpha` in [0, 1) is how far the next step has accumulated,
   * for interpolating between the previous and current simulation states.
   */
  render: (alpha: number, frameSeconds: number) => void;
  /** Fixed simulation step. Defaults to 1/60 s. */
  stepSeconds?: number;
  /** Upper bound on a single frame's elapsed time, so a background tab does not spiral. Defaults to 0.25 s. */
  maxFrameSeconds?: number;
  requestFrame?: (callback: (timeMs: number) => void) => number;
  cancelFrame?: (handle: number) => void;
}

/**
 * A fixed-timestep game loop: rendering runs once per animation frame, simulation runs
 * in fixed steps however many times are needed to catch up with real time.
 * See https://gafferongames.com/post/fix_your_timestep/
 */
export class GameLoop {
  readonly stepSeconds: number;
  readonly maxFrameSeconds: number;
  private readonly update: GameLoopOptions['update'];
  private readonly render: GameLoopOptions['render'];
  private readonly requestFrame: NonNullable<GameLoopOptions['requestFrame']>;
  private readonly cancelFrame: NonNullable<GameLoopOptions['cancelFrame']>;
  private running = false;
  private handle = 0;
  private lastTimeMs: number | null = null;
  private accumulator = 0;

  constructor(options: GameLoopOptions) {
    this.update = options.update;
    this.render = options.render;
    this.stepSeconds = options.stepSeconds ?? 1 / 60;
    this.maxFrameSeconds = options.maxFrameSeconds ?? 0.25;
    this.requestFrame = options.requestFrame ?? ((cb) => requestAnimationFrame(cb));
    this.cancelFrame = options.cancelFrame ?? ((h) => cancelAnimationFrame(h));
  }

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimeMs = null;
    this.accumulator = 0;
    this.handle = this.requestFrame(this.frame);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    this.cancelFrame(this.handle);
  }

  private readonly frame = (timeMs: number): void => {
    if (!this.running) return;
    const elapsed = this.lastTimeMs === null ? 0 : (timeMs - this.lastTimeMs) / 1000;
    const frameSeconds = Math.min(Math.max(elapsed, 0), this.maxFrameSeconds);
    this.lastTimeMs = timeMs;
    this.accumulator += frameSeconds;

    try {
      while (this.accumulator >= this.stepSeconds) {
        this.update(this.stepSeconds);
        this.accumulator -= this.stepSeconds;
      }
      this.render(this.accumulator / this.stepSeconds, frameSeconds);
    } catch (error) {
      this.running = false;
      throw error;
    }

    this.handle = this.requestFrame(this.frame);
  };
}
