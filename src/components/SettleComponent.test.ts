import { describe, expect, it } from 'vitest';
import { GameObject } from '../core/GameObject';
import { CollisionSystem } from '../physics/CollisionSystem';
import { EventManager } from '../events/EventManager';
import { PhysicsComponent } from './PhysicsComponent';
import { SettleComponent } from './SettleComponent';

const world = { width: 800, height: 600, floorY: 600 };

function crate(x: number, y: number): GameObject {
  const obj = new GameObject().moveTo(x, y).addComponent(new PhysicsComponent(world)).addComponent(new SettleComponent());
  obj.size.set(48, 48);
  obj.collider = { solid: true };
  return obj;
}

describe('SettleComponent', () => {
  it('stays dynamic while falling and becomes static once grounded', () => {
    const obj = crate(0, 0);
    obj.update(1 / 60);
    obj.endStep();
    expect(obj.collider?.static).toBeUndefined();
    for (let i = 0; i < 120; i++) {
      obj.update(1 / 60);
      obj.endStep();
    }
    expect(obj.grounded).toBe(true);
    expect(obj.collider?.static).toBe(true);
  });

  it('lets a dropped crate land on a settled one and settle on top', () => {
    const bottom = crate(100, 0);
    const top = crate(100, -200);
    const objects = [bottom, top];
    const events = new EventManager();
    const collisions = new CollisionSystem();
    for (let i = 0; i < 240; i++) {
      for (const o of objects) o.update(1 / 60);
      collisions.resolve(objects, events);
      for (const o of objects) o.endStep();
    }
    expect(bottom.position.y).toBe(552);
    expect(top.position.y).toBe(504);
    expect(top.collider?.static).toBe(true);
  });
});
