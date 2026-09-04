import { describe, expect, it } from 'vitest';
import { GameObject } from '../core/GameObject';
import { CollisionEvent } from './CollisionEvent';
import { EventType } from './EventType';

describe('CollisionEvent', () => {
  const a = new GameObject('a');
  const b = new GameObject('b');
  const c = new GameObject('c');
  const event = new CollisionEvent(a, b, 'y', 'bottom');

  it('has the collision type', () => {
    expect(event.type).toBe(EventType.Collision);
  });

  it('reports the other participant from either side', () => {
    expect(event.other(a)).toBe(b);
    expect(event.other(b)).toBe(a);
    expect(() => event.other(c)).toThrow(/not part of this collision/);
  });

  it('reports each participant\'s touched side as opposites', () => {
    expect(event.sideOf(a)).toBe('bottom');
    expect(event.sideOf(b)).toBe('top');
    expect(() => event.sideOf(c)).toThrow();
  });

  it('knows who is involved', () => {
    expect(event.involves(a)).toBe(true);
    expect(event.involves(c)).toBe(false);
  });
});
