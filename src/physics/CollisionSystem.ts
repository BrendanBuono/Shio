import type { GameObject } from '../core/GameObject';
import { CollisionEvent } from '../events/CollisionEvent';
import type { EventManager } from '../events/EventManager';
import { overlap, touchedSide, type Overlap } from './Aabb';

/**
 * Discrete axis-aligned box collision. After every object has moved, each overlapping
 * pair of colliders is pushed apart along the axis of least penetration (solids only)
 * and a CollisionEvent is fired for it. Objects are small and slow relative to the
 * step, so no sweeping is done; a fast enough object could still pass through a thin one.
 */
export class CollisionSystem {
  /** Resolves every overlapping pair among `objects`. Returns the number of collisions found. */
  resolve(objects: readonly GameObject[], events: EventManager): number {
    const colliders = objects.filter((o) => o.collider !== null);
    let count = 0;
    for (let i = 0; i < colliders.length; i++) {
      const a = colliders[i] as GameObject;
      for (let j = i + 1; j < colliders.length; j++) {
        const b = colliders[j] as GameObject;
        const o = overlap(a.bounds, b.bounds);
        if (!o) continue;
        if (a.collider?.solid && b.collider?.solid) separate(a, b, o);
        events.fire(new CollisionEvent(a, b, o.axis, touchedSide(o)));
        count++;
      }
    }
    return count;
  }
}

/** Moves solid `a` and `b` out of each other and cancels the velocity that carried them together. */
function separate(a: GameObject, b: GameObject, o: Overlap): void {
  const aStatic = a.collider?.static === true;
  const bStatic = b.collider?.static === true;
  if (aStatic && bStatic) return;
  const aShare = aStatic ? 0 : bStatic ? 1 : 0.5;
  const bShare = 1 - aShare;
  const axis = o.axis;

  a.position[axis] += o.sign * o.amount * aShare;
  b.position[axis] -= o.sign * o.amount * bShare;

  // `sign` is the direction that frees `a`, so `a` was travelling the other way.
  if (aShare > 0 && Math.sign(a.velocity[axis]) === -o.sign) a.velocity[axis] = 0;
  if (bShare > 0 && Math.sign(b.velocity[axis]) === o.sign) b.velocity[axis] = 0;

  if (axis === 'y') {
    if (o.sign === -1 && aShare > 0) a.grounded = true; // a came to rest on top of b
    if (o.sign === 1 && bShare > 0) b.grounded = true; // b came to rest on top of a
  }
}
