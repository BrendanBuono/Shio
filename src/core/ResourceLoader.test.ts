// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { ResourceLoader, resolveAssetUrl } from './ResourceLoader';

const ok = (body: unknown) => async () => ({ ok: true, status: 200, statusText: 'OK', json: async () => body });

describe('ResourceLoader', () => {
  it('parses JSON from a successful response', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200, statusText: 'OK', json: async () => ({ sprites: [] }) }));
    const loader = new ResourceLoader(fetchImpl);
    await expect(loader.loadJson<{ sprites: unknown[] }>('game/game.json')).resolves.toEqual({ sprites: [] });
    expect(fetchImpl).toHaveBeenCalledWith('game/game.json');
  });

  it('loads every sprite sheet named by a game description', async () => {
    const loader = new ResourceLoader(
      ok({
        sprites: [
          { name: 'player', source: 'sprites/player.png', frameWidth: 16, frameHeight: 16, animations: { idle: { frames: [0], fps: 1 } } },
          { name: 'tiles', source: 'sprites/tiles.png', frameWidth: 8, frameHeight: 8 },
        ],
      }),
    );
    const requested: string[] = [];
    vi.spyOn(loader, 'loadImage').mockImplementation(async (url) => {
      requested.push(url);
      return { width: 96, height: 16 } as HTMLImageElement;
    });
    const assets = await loader.loadGame('game/game.json');
    expect(requested.map((u) => new URL(u).pathname)).toEqual(['/game/sprites/player.png', '/game/sprites/tiles.png']);
    expect(assets.get('player')?.sheet.frameCount).toBe(6);
    expect(assets.get('player')?.animations.idle).toEqual({ frames: [0], fps: 1 });
    expect(assets.get('tiles')?.sheet.frameCount).toBe(24);
  });

  it('rejects an invalid game description before loading any images', async () => {
    const loader = new ResourceLoader(ok({ sprites: [{ name: 'bad' }] }));
    const loadImage = vi.spyOn(loader, 'loadImage');
    await expect(loader.loadGame('game/game.json')).rejects.toThrow('sprites[0].source');
    expect(loadImage).not.toHaveBeenCalled();
  });

  it('rejects when an image is not a whole number of frames', async () => {
    const loader = new ResourceLoader(ok({ sprites: [{ name: 'odd', source: 'odd.png', frameWidth: 16, frameHeight: 16 }] }));
    vi.spyOn(loader, 'loadImage').mockResolvedValue({ width: 100, height: 16 } as HTMLImageElement);
    await expect(loader.loadGame('game/game.json')).rejects.toThrow(/not a whole number/);
  });

  it('rejects with the status when the response is not ok', async () => {
    const loader = new ResourceLoader(async () => ({ ok: false, status: 404, statusText: 'Not Found', json: async () => ({}) }));
    await expect(loader.loadJson('missing.json')).rejects.toThrow('Failed to load missing.json: 404 Not Found');
  });
});

describe('resolveAssetUrl', () => {
  it('resolves sources relative to the game description, not the page', () => {
    expect(resolveAssetUrl('sprites/player.png', 'assets/game/game.json')).toMatch(/\/assets\/game\/sprites\/player\.png$/);
    expect(resolveAssetUrl('../shared/x.png', 'game/game.json')).toMatch(/\/shared\/x\.png$/);
  });
});
