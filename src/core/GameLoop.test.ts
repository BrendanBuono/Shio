import { describe, expect, it, vi } from 'vitest';
import { GameLoop } from './GameLoop';

/** Drives a GameLoop by hand with a fake requestAnimationFrame. */
function harness(overrides: Partial<ConstructorParameters<typeof GameLoop>[0]> = {}) {
  const callbacks: Array<(t: number) => void> = [];
  const update = vi.fn();
  const render = vi.fn();
  const cancelFrame = vi.fn();
  const loop = new GameLoop({
    update,
    render,
    stepSeconds: 0.01,
    requestFrame: (cb) => {
      callbacks.push(cb);
      return callbacks.length;
    },
    cancelFrame,
    ...overrides,
  });
  const tick = (timeMs: number) => {
    const cb = callbacks.shift();
    if (!cb) throw new Error('no frame requested');
    cb(timeMs);
  };
  return { loop, tick, update, render, cancelFrame, pendingFrames: () => callbacks.length };
}

describe('GameLoop', () => {
  it('runs no simulation steps on the first frame but still renders', () => {
    const h = harness();
    h.loop.start();
    h.tick(1000);
    expect(h.update).not.toHaveBeenCalled();
    expect(h.render).toHaveBeenCalledWith(0, 0);
  });

  it('runs as many fixed steps as fit in the elapsed time and carries the remainder', () => {
    const h = harness();
    h.loop.start();
    h.tick(1000);
    h.tick(1035);
    expect(h.update).toHaveBeenCalledTimes(3);
    expect(h.update).toHaveBeenCalledWith(0.01);
    const [alpha, frameSeconds] = h.render.mock.lastCall as [number, number];
    expect(alpha).toBeCloseTo(0.5);
    expect(frameSeconds).toBeCloseTo(0.035);
  });

  it('clamps a very long frame so the simulation cannot spiral', () => {
    // 1/64 and 0.25 are exact in binary, so the step count is exact too.
    const h = harness({ stepSeconds: 1 / 64, maxFrameSeconds: 0.25 });
    h.loop.start();
    h.tick(0);
    h.tick(60_000);
    expect(h.update).toHaveBeenCalledTimes(16);
  });

  it('keeps requesting frames while running and stops on stop()', () => {
    const h = harness();
    h.loop.start();
    h.tick(0);
    expect(h.pendingFrames()).toBe(1);
    h.loop.stop();
    expect(h.loop.isRunning).toBe(false);
    expect(h.cancelFrame).toHaveBeenCalledTimes(1);
    h.tick(16);
    expect(h.render).toHaveBeenCalledTimes(1);
    expect(h.pendingFrames()).toBe(0);
  });

  it('stops and rethrows if update throws, instead of silently dying', () => {
    const h = harness({
      update: () => {
        throw new Error('boom');
      },
    });
    h.loop.start();
    h.tick(0);
    expect(() => h.tick(20)).toThrow('boom');
    expect(h.loop.isRunning).toBe(false);
    expect(h.pendingFrames()).toBe(0);
  });
});
