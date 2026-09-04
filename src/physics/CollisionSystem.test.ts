import { describe, expect, it, vi } from 'vitest';
import { GameObject } from '../core/GameObject';
import type { CollisionEvent } from '../events/CollisionEvent';
import { EventManager } from '../events/EventManager';
import { EventType } from '../events/EventType';
import { CollisionSystem } from './CollisionSystem';

function box(x: number, y: number, collider: GameObject['collider'] = { solid: true }, size = 10): GameObject {
  const obj = new GameObject().moveTo(x, y);
  obj.size.set(size, size);
  obj.collider = collider;
  return obj;
}

function run(objects: GameObject[]) {
  const events = new EventManager();
  const fired: CollisionEvent[] = [];
  events.register(null, (e: CollisionEvent) => fired.push(e), EventType.Collision);
  const count = new CollisionSystem().resolve(objects, events);
  for (const o of objects) o.endStep();
  return { count, fired };
}

describe('CollisionSystem', () => {
  it('ignores objects without a collider and pairs that do not overlap', () => {
    const noCollider = box(0, 0, null);
    const { count, fired } = run([noCollider, box(5, 5), box(50, 50)]);
    expect(count).toBe(0);
    expect(fired).toEqual([]);
  });

  it('pushes a moving solid fully out of a static one and stops it', () => {
    const crate = box(100, 100, { solid: true, static: true });
    const hero = box(93, 100);
    hero.velocity.x = 50;
    run([crate, hero]);
    expect(hero.position.x).toBe(90);
    expect(hero.velocity.x).toBe(0);
    expect(crate.position.x).toBe(100);
  });

  it('splits the correction between two moving solids', () => {
    const left = box(0, 0);
    const right = box(6, 0);
    run([left, right]);
    expect(left.position.x).toBe(-2);
    expect(right.position.x).toBe(8);
  });

  it('lands an object on top of another, zeroing its fall and marking it grounded', () => {
    const crate = box(0, 100, { solid: true, static: true });
    const hero = box(2, 93);
    hero.velocity.y = 300;
    run([crate, hero]);
    expect(hero.position.y).toBe(90);
    expect(hero.velocity.y).toBe(0);
    expect(hero.grounded).toBe(true);
    expect(crate.grounded).toBe(false);
  });

  it('stops an object that hits something from below without grounding it', () => {
    const ceiling = box(0, 0, { solid: true, static: true });
    const hero = box(2, 7);
    hero.velocity.y = -200;
    run([ceiling, hero]);
    expect(hero.position.y).toBe(10);
    expect(hero.velocity.y).toBe(0);
    expect(hero.grounded).toBe(false);
  });

  it('does not cancel velocity that already points away', () => {
    const crate = box(100, 100, { solid: true, static: true });
    const hero = box(93, 100);
    hero.velocity.x = -50;
    run([crate, hero]);
    expect(hero.velocity.x).toBe(-50);
  });

  it('never pushes two static solids sideways but still reports them', () => {
    const a = box(0, 0, { solid: true, static: true });
    const b = box(5, 0, { solid: true, static: true });
    const { fired } = run([a, b]);
    expect(a.position.x).toBe(0);
    expect(b.position.x).toBe(5);
    expect(fired).toHaveLength(1);
  });

  it('stacks a static solid that has sunk into the one below it', () => {
    const lower = box(0, 100, { solid: true, static: true });
    const upper = box(2, 93, { solid: true, static: true });
    upper.velocity.y = 20;
    run([upper, lower]);
    expect(upper.position.y).toBe(90);
    expect(upper.velocity.y).toBe(0);
    expect(upper.grounded).toBe(true);
    expect(lower.position.y).toBe(100);
  });

  it('only reports non-solid overlaps without moving anything', () => {
    const trigger = box(0, 0, { solid: false });
    const hero = box(5, 0);
    const { fired } = run([trigger, hero]);
    expect(hero.position.x).toBe(5);
    expect(fired).toHaveLength(1);
    expect(fired[0]?.other(hero)).toBe(trigger);
  });

  it('fires an event naming the sides that touched, after separation', () => {
    const crate = box(0, 100, { solid: true, static: true });
    const hero = box(2, 93);
    const handler = vi.fn((e: CollisionEvent) => {
      expect(hero.position.y).toBe(90);
      expect(e.sideOf(hero)).toBe('bottom');
      expect(e.sideOf(crate)).toBe('top');
      expect(e.axis).toBe('y');
    });
    const events = new EventManager();
    events.register(null, handler, EventType.Collision);
    new CollisionSystem().resolve([crate, hero], events);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('checks every pair among three overlapping triggers', () => {
    const { count } = run([box(0, 0, { solid: false }), box(4, 0, { solid: false }), box(8, 0, { solid: false })]);
    expect(count).toBe(3);
  });

  it('separating an earlier pair can resolve a later one, which then reports nothing', () => {
    const { count } = run([box(0, 0), box(4, 0), box(8, 0)]);
    expect(count).toBe(2);
  });
});
