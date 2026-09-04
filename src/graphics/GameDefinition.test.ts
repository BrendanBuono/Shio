import { describe, expect, it } from 'vitest';
import { parseGameDefinition } from './GameDefinition';

const valid = {
  sprites: [
    {
      name: 'player',
      source: 'sprites/player.png',
      frameWidth: 16,
      frameHeight: 16,
      animations: { walk: { frames: [1, 2], fps: 8 }, die: { frames: [3], fps: 1, loop: false } },
    },
    { name: 'tiles', source: 'sprites/tiles.png', frameWidth: 16, frameHeight: 16 },
  ],
};

describe('parseGameDefinition', () => {
  it('accepts a valid definition and defaults animations to empty', () => {
    const def = parseGameDefinition(valid);
    expect(def.sprites).toHaveLength(2);
    expect(def.sprites[0]?.animations.walk).toEqual({ frames: [1, 2], fps: 8 });
    expect(def.sprites[0]?.animations.die).toEqual({ frames: [3], fps: 1, loop: false });
    expect(def.sprites[1]?.animations).toEqual({});
  });

  it('carries an optional level path', () => {
    expect(parseGameDefinition({ sprites: [] }).level).toBeUndefined();
    expect(parseGameDefinition({ sprites: [], level: 'level1.json' }).level).toBe('level1.json');
  });

  it.each([
    [null, 'must be an object'],
    [{ sprites: [], level: '' }, 'level must be a non-empty string'],
    [{}, 'sprites must be an array'],
    [{ sprites: [{}] }, 'sprites[0].name'],
    [{ sprites: [{ name: 'a', source: '', frameWidth: 16, frameHeight: 16 }] }, 'sprites[0].source'],
    [{ sprites: [{ name: 'a', source: 'x', frameWidth: 0, frameHeight: 16 }] }, 'sprites[0].frameWidth'],
    [{ sprites: [{ name: 'a', source: 'x', frameWidth: 16, frameHeight: 1.5 }] }, 'sprites[0].frameHeight'],
    [{ sprites: [{ name: 'a', source: 'x', frameWidth: 16, frameHeight: 16, animations: { w: { frames: [], fps: 1 } } }] }, 'animations.w.frames'],
    [{ sprites: [{ name: 'a', source: 'x', frameWidth: 16, frameHeight: 16, animations: { w: { frames: [-1], fps: 1 } } }] }, 'frames[0]'],
    [{ sprites: [{ name: 'a', source: 'x', frameWidth: 16, frameHeight: 16, animations: { w: { frames: [0], fps: 0 } } }] }, 'animations.w.fps'],
    [{ sprites: [{ name: 'a', source: 'x', frameWidth: 16, frameHeight: 16 }, { name: 'a', source: 'y', frameWidth: 1, frameHeight: 1 }] }, 'Duplicate sprite name'],
  ])('rejects %j naming the bad field', (input, message) => {
    expect(() => parseGameDefinition(input)).toThrow(message);
  });
});
