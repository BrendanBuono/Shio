import type { World } from '../components/PhysicsComponent';
import type { SpriteSheet } from '../graphics/SpriteSheet';
import { GameObject } from './GameObject';

export interface TiledGroundOptions {
  /** Frame drawn along the floor line. */
  topFrame: number;
  /** Frame drawn below it down to the bottom of the world. Defaults to the top frame. */
  fillFrame?: number;
  scale?: number;
}

/** Repeats a tile across the world's floor and fills the space below it. */
export class TiledGround extends GameObject {
  readonly topFrame: number;
  readonly fillFrame: number;
  readonly scale: number;

  constructor(
    private readonly world: World,
    readonly sheet: SpriteSheet,
    options: TiledGroundOptions,
  ) {
    super();
    this.topFrame = options.topFrame;
    this.fillFrame = options.fillFrame ?? options.topFrame;
    this.scale = options.scale ?? 1;
  }

  get tileWidth(): number {
    return this.sheet.frameWidth * this.scale;
  }

  get tileHeight(): number {
    return this.sheet.frameHeight * this.scale;
  }

  override draw(ctx: CanvasRenderingContext2D, _alpha: number): void {
    const { tileWidth, tileHeight, scale } = this;
    for (let x = 0; x < this.world.width; x += tileWidth) {
      this.sheet.draw(ctx, this.topFrame, x, this.world.floorY, { scale });
      for (let y = this.world.floorY + tileHeight; y < this.world.height; y += tileHeight) {
        this.sheet.draw(ctx, this.fillFrame, x, y, { scale });
      }
    }
  }
}
