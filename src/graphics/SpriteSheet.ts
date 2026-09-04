/** Anything drawImage accepts that also reports its size. */
export type SheetImage = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

export interface SpriteSheetOptions {
  frameWidth: number;
  frameHeight: number;
}

export interface DrawFrameOptions {
  /** Integer zoom factor. Defaults to 1. */
  scale?: number;
  /** Mirror the frame horizontally around its own centre. */
  flipX?: boolean;
}

export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A grid of equally sized frames in one image, indexed left to right then top to bottom. */
export class SpriteSheet {
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly columns: number;
  readonly rows: number;

  constructor(
    readonly name: string,
    readonly image: SheetImage,
    options: SpriteSheetOptions,
  ) {
    const { frameWidth, frameHeight } = options;
    if (!Number.isInteger(frameWidth) || frameWidth <= 0 || !Number.isInteger(frameHeight) || frameHeight <= 0) {
      throw new RangeError(`Sprite sheet '${name}' needs positive integer frame dimensions`);
    }
    if (image.width % frameWidth !== 0 || image.height % frameHeight !== 0) {
      throw new RangeError(
        `Sprite sheet '${name}' is ${image.width}x${image.height}, not a whole number of ${frameWidth}x${frameHeight} frames`,
      );
    }
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.columns = image.width / frameWidth;
    this.rows = image.height / frameHeight;
  }

  get frameCount(): number {
    return this.columns * this.rows;
  }

  frameRect(frame: number): FrameRect {
    if (!Number.isInteger(frame) || frame < 0 || frame >= this.frameCount) {
      throw new RangeError(`Sprite sheet '${this.name}' has no frame ${frame} (${this.frameCount} frames)`);
    }
    return {
      x: (frame % this.columns) * this.frameWidth,
      y: Math.floor(frame / this.columns) * this.frameHeight,
      width: this.frameWidth,
      height: this.frameHeight,
    };
  }

  draw(ctx: CanvasRenderingContext2D, frame: number, x: number, y: number, options: DrawFrameOptions = {}): void {
    const scale = options.scale ?? 1;
    const rect = this.frameRect(frame);
    const width = rect.width * scale;
    const height = rect.height * scale;
    if (options.flipX) {
      ctx.save();
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(this.image, rect.x, rect.y, rect.width, rect.height, 0, 0, width, height);
      ctx.restore();
    } else {
      ctx.drawImage(this.image, rect.x, rect.y, rect.width, rect.height, x, y, width, height);
    }
  }
}
