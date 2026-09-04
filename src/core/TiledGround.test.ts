import { describe, expect, it, vi } from 'vitest';
import { SpriteSheet } from '../graphics/SpriteSheet';
import { TiledGround } from './TiledGround';

const sheet = new SpriteSheet('tiles', { width: 32, height: 16 } as unknown as HTMLImageElement, { frameWidth: 16, frameHeight: 16 });

describe('TiledGround', () => {
  it('tiles the top frame along the floor and the fill frame beneath it', () => {
    const world = { width: 100, height: 100, floorY: 68 };
    const ground = new TiledGround(world, sheet, { topFrame: 0, fillFrame: 1, scale: 2 });
    const draw = vi.spyOn(sheet, 'draw').mockImplementation(() => undefined);
    ground.draw({} as CanvasRenderingContext2D, 0);
    const calls = draw.mock.calls.map(([, frame, x, y]) => [frame, x, y]);
    expect(calls).toEqual([
      [0, 0, 68],
      [0, 32, 68],
      [0, 64, 68],
      [0, 96, 68],
    ]);
    draw.mockRestore();
  });

  it('only draws the columns inside the viewport when the world has one', () => {
    const world = { width: 1000, height: 100, floorY: 84, viewport: { x: 250, y: 0, width: 100, height: 100 } };
    const ground = new TiledGround(world, sheet, { topFrame: 0 });
    const draw = vi.spyOn(sheet, 'draw').mockImplementation(() => undefined);
    ground.draw({} as CanvasRenderingContext2D, 0);
    expect(draw.mock.calls.map(([, , x]) => x)).toEqual([240, 256, 272, 288, 304, 320, 336, 352]);
    draw.mockRestore();
  });

  it('fills below the floor when there is room', () => {
    const world = { width: 16, height: 64, floorY: 16 };
    const ground = new TiledGround(world, sheet, { topFrame: 0, fillFrame: 1 });
    const draw = vi.spyOn(sheet, 'draw').mockImplementation(() => undefined);
    ground.draw({} as CanvasRenderingContext2D, 0);
    expect(draw.mock.calls.map(([, frame, , y]) => [frame, y])).toEqual([
      [0, 16],
      [1, 32],
      [1, 48],
    ]);
    draw.mockRestore();
  });
});
