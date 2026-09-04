import type { GameObject } from '../core/GameObject';
import { oppositeSide, type Side } from '../physics/Aabb';
import type { GameEvent } from './Event';
import { EventType } from './EventType';

/** Two objects overlapped this step. Fired after solid pairs have been pushed apart. */
export class CollisionEvent implements GameEvent {
  readonly type = EventType.Collision;

  constructor(
    readonly a: GameObject,
    readonly b: GameObject,
    readonly axis: 'x' | 'y',
    /** The side of `a` that touched `b`. */
    readonly aSide: Side,
  ) {}

  involves(object: GameObject): boolean {
    return object === this.a || object === this.b;
  }

  /** The other participant, from `object`'s point of view. */
  other(object: GameObject): GameObject {
    if (object === this.a) return this.b;
    if (object === this.b) return this.a;
    throw new Error(`Object ${object.id} is not part of this collision`);
  }

  /** The side of `object` that made contact. */
  sideOf(object: GameObject): Side {
    if (object === this.a) return this.aSide;
    if (object === this.b) return oppositeSide(this.aSide);
    throw new Error(`Object ${object.id} is not part of this collision`);
  }
}
