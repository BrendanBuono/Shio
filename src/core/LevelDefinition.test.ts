import { describe, expect, it } from 'vitest';
import { parseLevelDefinition } from './LevelDefinition';

describe('parseLevelDefinition', () => {
  it('accepts a valid level and defaults the name', () => {
    const level = parseLevelDefinition({ width: 2400, spawn: { x: 40, y: 40 }, objects: [{ type: 'crate', x: 320 }, { type: 'enemy', x: 640, y: 10 }] });
    expect(level).toEqual({
      name: 'untitled',
      width: 2400,
      spawn: { x: 40, y: 40 },
      objects: [{ type: 'crate', x: 320 }, { type: 'enemy', x: 640, y: 10 }],
    });
  });

  it.each([
    [null, 'must be an object'],
    [{ spawn: { x: 0, y: 0 }, objects: [] }, 'width must be a number'],
    [{ width: 0, spawn: { x: 0, y: 0 }, objects: [] }, 'width must be positive'],
    [{ width: 10, objects: [] }, 'spawn must be an object'],
    [{ width: 10, spawn: { x: 'a', y: 0 }, objects: [] }, 'spawn.x'],
    [{ width: 10, spawn: { x: 0, y: 0 } }, 'objects must be an array'],
    [{ width: 10, spawn: { x: 0, y: 0 }, objects: [{ x: 1 }] }, 'objects[0].type'],
    [{ width: 10, spawn: { x: 0, y: 0 }, objects: [{ type: 'crate' }] }, 'objects[0].x'],
    [{ width: 10, spawn: { x: 0, y: 0 }, objects: [{ type: 'crate', x: 1, y: 'top' }] }, 'objects[0].y'],
    [{ width: 10, spawn: { x: 0, y: 0 }, objects: [], name: 3 }, 'name must be a string'],
  ])('rejects %j naming the bad field', (input, message) => {
    expect(() => parseLevelDefinition(input)).toThrow(message);
  });
});
