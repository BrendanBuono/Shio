import { describe, expect, it, vi } from 'vitest';
import { SpriteSheet } from './SpriteSheet';

const image = (width: number, height: number) => ({ width, height }) as unknown as HTMLImageElement;

function fakeContext() {
  return { drawImage: vi.fn(), save: vi.fn(), restore: vi.fn(), translate: vi.fn(), scale: vi.fn() };
}

describe('SpriteSheet', () => {
  it('derives the grid from the image and frame size', () => {
    const sheet = new SpriteSheet('s', image(96, 32), { frameWidth: 16, frameHeight: 16 });
    expect(sheet.columns).toBe(6);
    expect(sheet.rows).toBe(2);
    expect(sheet.frameCount).toBe(12);
  });

  it('rejects an image that is not a whole number of frames', () => {
    expect(() => new SpriteSheet('s', image(100, 16), { frameWidth: 16, frameHeight: 16 })).toThrow(RangeError);
  });

  it('rejects non-positive or fractional frame sizes', () => {
    expect(() => new SpriteSheet('s', image(96, 16), { frameWidth: 0, frameHeight: 16 })).toThrow(RangeError);
    expect(() => new SpriteSheet('s', image(96, 16), { frameWidth: 1.5, frameHeight: 16 })).toThrow(RangeError);
  });

  it('indexes frames left to right, then top to bottom', () => {
    const sheet = new SpriteSheet('s', image(48, 32), { frameWidth: 16, frameHeight: 16 });
    expect(sheet.frameRect(0)).toEqual({ x: 0, y: 0, width: 16, height: 16 });
    expect(sheet.frameRect(2)).toEqual({ x: 32, y: 0, width: 16, height: 16 });
    expect(sheet.frameRect(4)).toEqual({ x: 16, y: 16, width: 16, height: 16 });
  });

  it('throws for a frame that does not exist', () => {
    const sheet = new SpriteSheet('s', image(32, 16), { frameWidth: 16, frameHeight: 16 });
    expect(() => sheet.frameRect(2)).toThrow(/no frame 2/);
    expect(() => sheet.frameRect(-1)).toThrow(RangeError);
    expect(() => sheet.frameRect(0.5)).toThrow(RangeError);
  });

  it('draws the frame scaled at the given position', () => {
    const img = image(32, 16);
    const sheet = new SpriteSheet('s', img, { frameWidth: 16, frameHeight: 16 });
    const ctx = fakeContext();
    sheet.draw(ctx as unknown as CanvasRenderingContext2D, 1, 100, 200, { scale: 3 });
    expect(ctx.drawImage).toHaveBeenCalledWith(img, 16, 0, 16, 16, 100, 200, 48, 48);
    expect(ctx.save).not.toHaveBeenCalled();
  });

  it('mirrors around the frame when flipped, leaving the context as it found it', () => {
    const img = image(32, 16);
    const sheet = new SpriteSheet('s', img, { frameWidth: 16, frameHeight: 16 });
    const ctx = fakeContext();
    sheet.draw(ctx as unknown as CanvasRenderingContext2D, 0, 100, 200, { scale: 2, flipX: true });
    expect(ctx.translate).toHaveBeenCalledWith(132, 200);
    expect(ctx.scale).toHaveBeenCalledWith(-1, 1);
    expect(ctx.drawImage).toHaveBeenCalledWith(img, 0, 0, 16, 16, 0, 0, 32, 32);
    expect(ctx.save).toHaveBeenCalledTimes(1);
    expect(ctx.restore).toHaveBeenCalledTimes(1);
  });
});
