import { describe, expect, it } from 'vitest';
import { intersects, oppositeSide, overlap, touchedSide } from './Aabb';

const rect = (x: number, y: number, width = 10, height = 10) => ({ x, y, width, height });

describe('intersects', () => {
  it('is true for overlapping rectangles and false for separated or touching ones', () => {
    expect(intersects(rect(0, 0), rect(5, 5))).toBe(true);
    expect(intersects(rect(0, 0), rect(20, 0))).toBe(false);
    expect(intersects(rect(0, 0), rect(10, 0))).toBe(false);
    expect(intersects(rect(0, 0), rect(0, 10))).toBe(false);
  });
});

describe('overlap', () => {
  it('is null when apart or merely touching', () => {
    expect(overlap(rect(0, 0), rect(10, 0))).toBeNull();
    expect(overlap(rect(0, 0), rect(0, 10))).toBeNull();
    expect(overlap(rect(0, 0), rect(50, 50))).toBeNull();
  });

  it('picks the axis with the smaller penetration', () => {
    expect(overlap(rect(0, 0), rect(8, 2))).toEqual({ axis: 'x', amount: 2, sign: -1 });
    expect(overlap(rect(0, 0), rect(2, 8))).toEqual({ axis: 'y', amount: 2, sign: -1 });
  });

  it('points the sign away from the other rectangle', () => {
    expect(overlap(rect(8, 0), rect(0, 0))?.sign).toBe(1);
    expect(overlap(rect(0, 8), rect(0, 0))?.sign).toBe(1);
    expect(overlap(rect(0, 0), rect(0, 8))?.sign).toBe(-1);
  });

  it('prefers y when penetrations tie, so a corner landing counts as landing', () => {
    expect(overlap(rect(0, 0), rect(5, 5))?.axis).toBe('y');
  });
});

describe('touchedSide and oppositeSide', () => {
  it('names the side of the first rectangle that made contact', () => {
    expect(touchedSide({ axis: 'y', amount: 1, sign: -1 })).toBe('bottom');
    expect(touchedSide({ axis: 'y', amount: 1, sign: 1 })).toBe('top');
    expect(touchedSide({ axis: 'x', amount: 1, sign: -1 })).toBe('right');
    expect(touchedSide({ axis: 'x', amount: 1, sign: 1 })).toBe('left');
  });

  it('opposite sides pair up', () => {
    expect(oppositeSide('top')).toBe('bottom');
    expect(oppositeSide('bottom')).toBe('top');
    expect(oppositeSide('left')).toBe('right');
    expect(oppositeSide('right')).toBe('left');
  });
});
