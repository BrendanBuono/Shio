import { describe, expect, it, vi } from 'vitest';
import { ResourceLoader } from './ResourceLoader';

describe('ResourceLoader', () => {
  it('parses JSON from a successful response', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200, statusText: 'OK', json: async () => ({ sprites: [] }) }));
    const loader = new ResourceLoader(fetchImpl);
    await expect(loader.loadJson<{ sprites: unknown[] }>('game/game.json')).resolves.toEqual({ sprites: [] });
    expect(fetchImpl).toHaveBeenCalledWith('game/game.json');
  });

  it('rejects with the status when the response is not ok', async () => {
    const loader = new ResourceLoader(async () => ({ ok: false, status: 404, statusText: 'Not Found', json: async () => ({}) }));
    await expect(loader.loadJson('missing.json')).rejects.toThrow('Failed to load missing.json: 404 Not Found');
  });
});
