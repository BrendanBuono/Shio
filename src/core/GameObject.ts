import type { CollisionEvent } from '../events/CollisionEvent';
import type { Rect } from '../physics/Aabb';
import { Vector2 } from '../physics/Vector2';
import { createId } from '../utility/uuid';

/** Behaviour attached to a GameObject. Components run in the order they were added. */
export interface Component {
  update(owner: GameObject, stepSeconds: number): void;
  draw?(owner: GameObject, ctx: CanvasRenderingContext2D, alpha: number): void;
  /** Called for every collision the owner takes part in, after solid pairs are separated. */
  onCollision?(owner: GameObject, event: CollisionEvent): void;
}

export interface Collider {
  /** Solid objects are pushed apart. Non-solid ones only report overlaps. */
  solid: boolean;
  /** Static solids never move; the other object takes the whole correction. */
  static?: boolean;
}

export class GameObject {
  readonly id: string;
  readonly position = new Vector2();
  /** Position at the start of the current step, for render interpolation. */
  readonly previousPosition = new Vector2();
  /** Pixels per second. */
  readonly velocity = new Vector2();
  /** Pixels per second squared. */
  readonly acceleration = new Vector2();
  readonly size = new Vector2(20, 20);
  grounded = false;
  /** Null means the object takes no part in collision. */
  collider: Collider | null = null;
  /** Free-form labels other objects can test, such as 'player' or 'enemy'. */
  readonly tags = new Set<string>();
  private readonly components: Component[] = [];

  constructor(id: string = createId()) {
    this.id = id;
  }

  addComponent(component: Component): this {
    this.components.push(component);
    return this;
  }

  /** Teleports the object, resetting interpolation so it does not slide from its old spot. */
  moveTo(x: number, y: number): this {
    this.position.set(x, y);
    this.previousPosition.set(x, y);
    return this;
  }

  update(stepSeconds: number): void {
    this.previousPosition.copy(this.position);
    for (const component of this.components) {
      component.update(this, stepSeconds);
    }
  }

  get bounds(): Rect {
    return { x: this.position.x, y: this.position.y, width: this.size.x, height: this.size.y };
  }

  onCollision(event: CollisionEvent): void {
    for (const component of this.components) {
      component.onCollision?.(this, event);
    }
  }

  /** Where to draw the object this frame, given how far into the next step we are. */
  renderPosition(alpha: number): Vector2 {
    return Vector2.lerp(this.previousPosition, this.position, alpha);
  }

  /** Draws each component that knows how to draw. Subclasses may override to draw themselves. */
  draw(ctx: CanvasRenderingContext2D, alpha: number): void {
    for (const component of this.components) {
      component.draw?.(this, ctx, alpha);
    }
  }
}
