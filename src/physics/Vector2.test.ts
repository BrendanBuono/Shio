import { describe, expect, it } from 'vitest';
import { Vector2 } from './Vector2';

describe('Vector2', () => {
  it('adds in place and returns itself for chaining', () => {
    const v = new Vector2(1, 1);
    expect(v.add(new Vector2(2, 3))).toBe(v);
    expect(v).toEqual(new Vector2(3, 4));
  });

  it('subtracts in place', () => {
    expect(new Vector2(1, 1).subtract(new Vector2(1, 1))).toEqual(new Vector2(0, 0));
  });

  it('scales in place', () => {
    expect(new Vector2(2, -3).scale(0.5)).toEqual(new Vector2(1, -1.5));
  });

  it('clones without aliasing', () => {
    const a = new Vector2(1, 2);
    const b = a.clone();
    b.x = 9;
    expect(a.x).toBe(1);
  });

  it('computes length', () => {
    expect(new Vector2(3, 4).length()).toBe(5);
  });

  it('interpolates between two vectors', () => {
    const a = new Vector2(0, 0);
    const b = new Vector2(10, -10);
    expect(Vector2.lerp(a, b, 0.25)).toEqual(new Vector2(2.5, -2.5));
    expect(Vector2.lerp(a, b, 1)).toEqual(b);
  });
});
