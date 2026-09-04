import { describe, expect, it } from 'vitest';
import { GameObject } from '../core/GameObject';
import type { ActorDestroyedEvent } from '../events/ActorEvents';
import { CollisionEvent } from '../events/CollisionEvent';
import { EventManager } from '../events/EventManager';
import { EventType } from '../events/EventType';
import { EnemyComponent, SQUASHED } from './EnemyComponent';

const world = { width: 300, height: 200, floorY: 200 };

function enemy(x: number, options = {}) {
  const events = new EventManager();
  const component = new EnemyComponent(world, events, { speed: 100, ...options });
  const obj = new GameObject().moveTo(x, 0).addComponent(component);
  obj.size.set(20, 20);
  obj.collider = { solid: true };
  obj.tags.add('enemy');
  return { obj, component, events };
}

describe('EnemyComponent', () => {
  it('walks left by default at its speed', () => {
    const { obj } = enemy(100);
    obj.update(1 / 60);
    expect(obj.velocity.x).toBe(-100);
  });

  it('turns around at the world edges', () => {
    const { obj, component } = enemy(0);
    obj.update(1 / 60);
    expect(component.direction).toBe(1);
    obj.moveTo(280, 0);
    obj.update(1 / 60);
    expect(component.direction).toBe(-1);
  });

  it('turns around when it walks into a solid obstacle', () => {
    const { obj, component } = enemy(100);
    const crate = new GameObject();
    crate.collider = { solid: true, static: true };
    obj.onCollision(new CollisionEvent(obj, crate, 'x', 'left'));
    expect(component.direction).toBe(1);
    obj.onCollision(new CollisionEvent(crate, obj, 'x', 'left'));
    expect(component.direction).toBe(-1);
  });

  it('does not turn for the player, non-solids, or vertical contacts', () => {
    const { obj, component } = enemy(100);
    const player = new GameObject();
    player.collider = { solid: true };
    player.tags.add('player');
    obj.onCollision(new CollisionEvent(obj, player, 'x', 'left'));
    const trigger = new GameObject();
    trigger.collider = { solid: false };
    obj.onCollision(new CollisionEvent(obj, trigger, 'x', 'left'));
    const floorish = new GameObject();
    floorish.collider = { solid: true, static: true };
    obj.onCollision(new CollisionEvent(obj, floorish, 'y', 'bottom'));
    expect(component.direction).toBe(-1);
  });

  it('when squashed it stops, stops being solid, and asks to be destroyed after the delay', () => {
    const { obj, component, events } = enemy(100, { squashSeconds: 0.1 });
    const destroyed: GameObject[] = [];
    events.register(null, (e: ActorDestroyedEvent) => destroyed.push(e.actor), EventType.ActorDestroyed);
    obj.velocity.x = -100;
    obj.tags.add(SQUASHED);
    obj.update(0.05);
    expect(obj.velocity.x).toBe(0);
    expect(obj.collider?.solid).toBe(false);
    expect(component.isSquashed).toBe(true);
    events.update();
    expect(destroyed).toEqual([]);
    obj.update(0.05);
    obj.update(0.05);
    events.update();
    expect(destroyed).toEqual([obj]);
  });
});
