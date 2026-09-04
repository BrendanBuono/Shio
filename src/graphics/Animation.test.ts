import { describe, expect, it } from 'vitest';
import { Animation } from './Animation';

describe('Animation', () => {
  it('shows frames in order at the given rate', () => {
    const anim = new Animation({ frames: [3, 4, 5], fps: 10 });
    expect(anim.frame).toBe(3);
    anim.advance(0.1);
    expect(anim.frame).toBe(4);
    anim.advance(0.1);
    expect(anim.frame).toBe(5);
  });

  it('loops back to the start by default', () => {
    const anim = new Animation({ frames: [1, 2], fps: 10 });
    anim.advance(0.2);
    expect(anim.frame).toBe(1);
    expect(anim.finished).toBe(false);
  });

  it('holds the last frame when not looping', () => {
    const anim = new Animation({ frames: [1, 2], fps: 10, loop: false });
    anim.advance(5);
    expect(anim.frame).toBe(2);
    expect(anim.finished).toBe(true);
  });

  it('accumulates small steps rather than snapping per step', () => {
    // 1/64 is exact in binary, so 16 steps sum to exactly 0.25 s.
    const anim = new Animation({ frames: [0, 1], fps: 4 });
    for (let i = 0; i < 15; i++) anim.advance(1 / 64);
    expect(anim.frame).toBe(0);
    anim.advance(1 / 64);
    expect(anim.frame).toBe(1);
  });

  it('reset returns to the first frame', () => {
    const anim = new Animation({ frames: [7, 8], fps: 1 });
    anim.advance(1);
    anim.reset();
    expect(anim.frame).toBe(7);
  });

  it('rejects empty frame lists and non-positive rates', () => {
    expect(() => new Animation({ frames: [], fps: 1 })).toThrow(RangeError);
    expect(() => new Animation({ frames: [0], fps: 0 })).toThrow(RangeError);
  });
});
