import type { Component, GameObject } from '../core/GameObject';
import type { Rect } from '../physics/Aabb';

/** The bounds objects are kept inside. Objects stand on `floorY`, which is at or above `height`. */
export interface World {
  readonly width: number;
  readonly height: number;
  readonly floorY: number;
  /** The part of the world currently on screen, when there is a camera. */
  readonly viewport?: Rect;
}

export interface PhysicsOptions {
  /** Downward acceleration in pixels per second squared. Defaults to 1200. */
  gravity?: number;
}

/** Semi-implicit Euler integration with gravity, a floor, and side walls. */
export class PhysicsComponent implements Component {
  readonly gravity: number;

  constructor(
    private readonly world: World,
    options: PhysicsOptions = {},
  ) {
    this.gravity = options.gravity ?? 1200;
  }

  update(owner: GameObject, stepSeconds: number): void {
    const { position, velocity, acceleration, size } = owner;

    velocity.x += acceleration.x * stepSeconds;
    velocity.y += (acceleration.y + this.gravity) * stepSeconds;
    position.x += velocity.x * stepSeconds;
    position.y += velocity.y * stepSeconds;

    const floor = this.world.floorY - size.y;
    if (position.y >= floor) {
      position.y = floor;
      if (velocity.y > 0) velocity.y = 0;
      owner.support = true;
    } else {
      owner.support = false;
    }

    const rightWall = this.world.width - size.x;
    if (position.x < 0) {
      position.x = 0;
      if (velocity.x < 0) velocity.x = 0;
    } else if (position.x > rightWall) {
      position.x = rightWall;
      if (velocity.x > 0) velocity.x = 0;
    }
  }
}
