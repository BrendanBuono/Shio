import { GameObject } from './GameObject';

/** A solid-colour rectangle. The original engine's only actor. */
export class Box extends GameObject {
  constructor(
    public color = '#ff0000',
    id?: string,
  ) {
    super(id);
  }

  override draw(ctx: CanvasRenderingContext2D, alpha: number): void {
    const { x, y } = this.renderPosition(alpha);
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(x), Math.round(y), this.size.x, this.size.y);
  }
}
