/** A mutable 2D vector. Mutating methods return `this` so calls can be chained. */
export class Vector2 {
  constructor(
    public x = 0,
    public y = 0,
  ) {}

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(other: Vector2): this {
    return this.set(other.x, other.y);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(other: Vector2): this {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other: Vector2): this {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  scale(factor: number): this {
    this.x *= factor;
    this.y *= factor;
    return this;
  }

  length(): number {
    return Math.hypot(this.x, this.y);
  }

  /** Linear interpolation from `a` (t = 0) to `b` (t = 1), returned as a new vector. */
  static lerp(a: Vector2, b: Vector2, t: number): Vector2 {
    return new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }
}
