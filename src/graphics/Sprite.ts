import { ResourceLoader } from '../core/ResourceLoader';

/** A named image that can be drawn to a canvas. Construct via `Sprite.load` so the image is ready. */
export class Sprite {
  constructor(
    readonly name: string,
    readonly image: HTMLImageElement,
  ) {}

  static async load(name: string, url: string, loader = new ResourceLoader()): Promise<Sprite> {
    return new Sprite(name, await loader.loadImage(url));
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.drawImage(this.image, x, y);
  }
}
