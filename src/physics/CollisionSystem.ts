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
  if (aStatic && bStatic) {
    // Static bodies never push each other sideways, but they do stack: gravity still
    // acts on them so that a level re-floors on resize, and the upper one rests on the lower.
    if (o.axis === 'y') stack(a, b, o);
    return;
  }
  const aShare = aStatic ? 0 : bStatic ? 1 : 0.5;
  const bShare = 1 - aShare;
  const axis = o.axis;
  const aSize = axis === 'x' ? a.size.x : a.size.y;
  const bSize = axis === 'x' ? b.size.x : b.size.y;

  // When one side takes the whole correction, place it exactly against the other so
  // resting objects sit on whole pixels instead of accumulating rounding error.
  if (aShare === 1) {
    a.position[axis] = o.sign === -1 ? b.position[axis] - aSize : b.position[axis] + bSize;
  } else if (bShare === 1) {
    b.position[axis] = o.sign === -1 ? a.position[axis] + aSize : a.position[axis] - bSize;
  } else {
    a.position[axis] += o.sign * o.amount * aShare;
    b.position[axis] -= o.sign * o.amount * bShare;
  }

  // `sign` is the direction that frees `a`, so `a` was travelling the other way.
  if (aShare > 0 && Math.sign(a.velocity[axis]) === -o.sign) a.velocity[axis] = 0;
  if (bShare > 0 && Math.sign(b.velocity[axis]) === o.sign) b.velocity[axis] = 0;

  if (axis === 'y') {
    if (o.sign === -1 && aShare > 0) a.support = true; // a came to rest on top of b
    if (o.sign === 1 && bShare > 0) b.support = true; // b came to rest on top of a
  }
}

/** Rests whichever of two static bodies is on top exactly on the other. */
function stack(a: GameObject, b: GameObject, o: Overlap): void {
  const [upper, lower] = o.sign === -1 ? [a, b] : [b, a];
  upper.position.y = lower.position.y - upper.size.y;
  if (upper.velocity.y > 0) upper.velocity.y = 0;
  upper.support = true;
}
