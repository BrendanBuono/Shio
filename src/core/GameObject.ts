import { Vector2 } from '../physics/Vector2';
import { createId } from '../utility/uuid';

/** Behaviour attached to a GameObject. Components run in the order they were added. */
export interface Component {
  update(owner: GameObject, stepSeconds: number): void;
  draw?(owner: GameObject, ctx: CanvasRenderingContext2D, alpha: number): void;
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
