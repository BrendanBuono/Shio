import { describe, expect, it } from 'vitest';
import { Camera } from './Camera';

const viewport = { width: 400, height: 300 };
const bounds = { x: 0, y: 0, width: 2000, height: 300 };
const target = (x: number) => ({ x, y: 200, width: 40, height: 40 });

describe('Camera', () => {
  it('snaps onto the target the first time it follows', () => {
    const cam = new Camera();
    cam.follow(target(1000), viewport, bounds, 1 / 60);
    expect(cam.x).toBe(1020 - 200);
    expect(cam.y).toBe(0);
  });

  it('does not move while the target stays inside the dead zone', () => {
    const cam = new Camera({ deadZone: 0.5 });
    cam.snapTo(target(1000), viewport, bounds);
    const before = cam.x;
    cam.follow(target(1080), viewport, bounds, 1 / 60);
    expect(cam.x).toBe(before);
  });

  it('closes on the target once it leaves the dead zone', () => {
    const cam = new Camera({ deadZone: 0.5, responsiveness: 8 });
    cam.snapTo(target(1000), viewport, bounds);
    for (let i = 0; i < 120; i++) cam.follow(target(1300), viewport, bounds, 1 / 60);
    // The target's centre (1320) should end up on the right edge of the dead zone (view centre + 100).
    expect(cam.x + 200 + 100).toBeCloseTo(1320, 0);
  });

  it('moves smoothly rather than jumping', () => {
    const cam = new Camera({ deadZone: 0, responsiveness: 8 });
    cam.snapTo(target(1000), viewport, bounds);
    cam.follow(target(1200), viewport, bounds, 1 / 60);
    expect(cam.x).toBeGreaterThan(820);
    expect(cam.x).toBeLessThan(1020);
  });

  it('never shows anything outside the bounds', () => {
    const cam = new Camera();
    cam.snapTo(target(0), viewport, bounds);
    expect(cam.x).toBe(0);
    cam.snapTo(target(1990), viewport, bounds);
    expect(cam.x).toBe(1600);
  });

  it('pins to the start when the viewport is larger than the world', () => {
    const cam = new Camera();
    cam.snapTo(target(100), viewport, { x: 0, y: 0, width: 300, height: 300 });
    expect(cam.x).toBe(0);
  });

  it('reports the visible rectangle', () => {
    const cam = new Camera();
    cam.snapTo(target(1000), viewport, bounds);
    expect(cam.view(viewport)).toEqual({ x: 820, y: 0, width: 400, height: 300 });
  });
});
