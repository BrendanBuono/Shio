import { GameObject } from './GameObject';

export interface LabelOptions {
  font?: string;
  color?: string;
}

/** Draws a line of text at its position. The text is a function so it can show live values. */
export class Label extends GameObject {
  readonly font: string;
  readonly color: string;

  constructor(
    readonly text: () => string,
    options: LabelOptions = {},
  ) {
    super();
    this.font = options.font ?? '12px monospace';
    this.color = options.color ?? '#ffffff';
  }

  override draw(ctx: CanvasRenderingContext2D, _alpha: number): void {
    ctx.fillStyle = this.color;
    ctx.font = this.font;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'start';
    ctx.fillText(this.text(), this.position.x, this.position.y);
  }
}
