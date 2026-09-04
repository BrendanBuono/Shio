import type { Component, GameObject } from '../core/GameObject';
import { ActorDestroyedEvent } from '../events/ActorEvents';
import type { CollisionEvent } from '../events/CollisionEvent';
import type { EventManager } from '../events/EventManager';
import type { World } from './PhysicsComponent';

export interface EnemyOptions {
  /** Patrol speed in pixels per second. Defaults to 90. */
  speed?: number;
  /** Which way to walk first. Defaults to left. */
  direction?: 1 | -1;
  /** How long the squashed frame shows before the enemy is removed. Defaults to 0.4 s. */
  squashSeconds?: number;
}

/** Tag another object adds to squash this enemy. */
export const SQUASHED = 'squashed';

/**
 * Walks back and forth, turning at the world's edges and at solid obstacles.
 * Once tagged squashed it stops, stops being solid, and asks to be destroyed after a delay.
 */
export class EnemyComponent implements Component {
  readonly speed: number;
  readonly squashSeconds: number;
  direction: 1 | -1;
  private squashedFor = 0;
  private destroyRequested = false;

  constructor(
    private readonly world: World,
    private readonly events: EventManager,
    options: EnemyOptions = {},
  ) {
    this.speed = options.speed ?? 90;
    this.direction = options.direction ?? -1;
    this.squashSeconds = options.squashSeconds ?? 0.4;
  }

  get isSquashed(): boolean {
    return this.squashedFor > 0 || this.destroyRequested;
  }

  update(owner: GameObject, stepSeconds: number): void {
    if (owner.tags.has(SQUASHED)) {
      owner.velocity.x = 0;
      if (owner.collider?.solid) owner.collider = { ...owner.collider, solid: false };
      this.squashedFor += stepSeconds;
      if (this.squashedFor >= this.squashSeconds && !this.destroyRequested) {
        this.destroyRequested = true;
        this.events.queue(new ActorDestroyedEvent(owner));
      }
      return;
    }
    if (owner.position.x <= 0) this.direction = 1;
    else if (owner.position.x >= this.world.width - owner.size.x) this.direction = -1;
    owner.velocity.x = this.direction * this.speed;
  }

  onCollision(owner: GameObject, event: CollisionEvent): void {
    if (owner.tags.has(SQUASHED) || event.axis !== 'x') return;
    const other = event.other(owner);
    if (other.collider?.solid && !other.tags.has('player')) {
      this.direction = event.sideOf(owner) === 'left' ? 1 : -1;
    }
  }
}
