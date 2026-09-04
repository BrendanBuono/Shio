export interface AnimationDefinition {
  /** Sprite sheet frame indices, played in order. */
  readonly frames: readonly number[];
  /** Frames per second. */
  readonly fps: number;
  /** Whether to start over after the last frame. Defaults to true. */
  readonly loop?: boolean;
}

/** Plays a list of frames at a fixed rate. Advance it once per simulation step. */
export class Animation {
  readonly frames: readonly number[];
  readonly fps: number;
  readonly loop: boolean;
  private elapsed = 0;

  constructor(definition: AnimationDefinition) {
    if (definition.frames.length === 0) throw new RangeError('An animation needs at least one frame');
    if (!(definition.fps > 0)) throw new RangeError('Animation fps must be positive');
    this.frames = [...definition.frames];
    this.fps = definition.fps;
    this.loop = definition.loop ?? true;
  }

  get duration(): number {
    return this.frames.length / this.fps;
  }

  /** The sprite sheet frame to show right now. */
  get frame(): number {
    const index = Math.floor(this.elapsed * this.fps);
    const clamped = this.loop ? index % this.frames.length : Math.min(index, this.frames.length - 1);
    return this.frames[clamped] as number;
  }

  get finished(): boolean {
    return !this.loop && this.elapsed >= this.duration;
  }

  advance(seconds: number): void {
    this.elapsed += seconds;
    if (this.loop && this.elapsed >= this.duration) {
      this.elapsed %= this.duration;
    }
  }

  reset(): void {
    this.elapsed = 0;
  }
}
