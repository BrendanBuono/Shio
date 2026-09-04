import { describe, expect, it } from 'vitest';
import { GameObject } from '../core/GameObject';
import { PhysicsComponent } from './PhysicsComponent';

const world = { width: 800, height: 600 };

function simulate(seconds: number, step: number, setup?: (o: GameObject) => void): GameObject {
  const obj = new GameObject().moveTo(100, 0).addComponent(new PhysicsComponent(world, { gravity: 1000 }));
  setup?.(obj);
  const steps = Math.round(seconds / step);
  for (let i = 0; i < steps; i++) obj.update(step);
  return obj;
}

describe('PhysicsComponent', () => {
  it('accelerates downward under gravity', () => {
    const obj = new GameObject().moveTo(0, 0).addComponent(new PhysicsComponent(world, { gravity: 1000 }));
    obj.update(0.1);
    expect(obj.velocity.y).toBeCloseTo(100);
    expect(obj.position.y).toBeCloseTo(10);
    expect(obj.grounded).toBe(false);
  });

  it('is frame-rate independent to within first-order integration error', () => {
    // Semi-implicit Euler under constant acceleration g overshoots the analytic
    // distance g*t^2/2 by exactly g*t*dt/2, so halving dt halves the error.
    const gravity = 1000;
    const seconds = 0.5;
    const analytic = (gravity * seconds * seconds) / 2;
    for (const step of [1 / 30, 1 / 60, 1 / 240]) {
      const error = simulate(seconds, step).position.y - analytic;
      expect(error).toBeCloseTo((gravity * seconds * step) / 2, 6);
    }
  });

  it('lands on the floor, stops falling and reports grounded', () => {
    const obj = simulate(3, 1 / 60);
    expect(obj.position.y).toBe(world.height - obj.size.y);
    expect(obj.velocity.y).toBe(0);
    expect(obj.grounded).toBe(true);
  });

  it('leaves the ground when given upward velocity', () => {
    const obj = simulate(3, 1 / 60);
    obj.velocity.y = -300;
    obj.update(1 / 60);
    expect(obj.grounded).toBe(false);
    expect(obj.position.y).toBeLessThan(world.height - obj.size.y);
  });

  it('cannot leave through the side walls', () => {
    const left = simulate(1, 1 / 60, (o) => (o.velocity.x = -5000));
    expect(left.position.x).toBe(0);
    expect(left.velocity.x).toBe(0);
    const right = simulate(1, 1 / 60, (o) => (o.velocity.x = 5000));
    expect(right.position.x).toBe(world.width - right.size.x);
  });
});
