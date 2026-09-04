import type { Component, GameObject } from '../core/GameObject';
import { PlayerDiedEvent } from '../events/ActorEvents';
import type { CollisionEvent } from '../events/CollisionEvent';
import type { EventManager } from '../events/EventManager';
import { SQUASHED } from './EnemyComponent';

export interface PlayerRulesOptions {
  /** Upward speed after stomping an enemy, in pixels per second. Defaults to 260. */
  bounceSpeed?: number;
  /** How far below an enemy's top the player's feet may have started and still count as a stomp. Defaults to 6 px. */
  stompTolerance?: number;
}

/**
 * What happens when the player touches an enemy: landing on it from above squashes it
 * and bounces the player, anything else kills the player.
 */
export class PlayerRulesComponent implements Component {
  readonly bounceSpeed: number;
  readonly stompTolerance: number;
  stomps = 0;

  constructor(
    private readonly events: EventManager,
    options: PlayerRulesOptions = {},
  ) {
    this.bounceSpeed = options.bounceSpeed ?? 260;
    this.stompTolerance = options.stompTolerance ?? 6;
  }

  update(): void {
    // Nothing per step; this component reacts to collisions only.
  }

  onCollision(owner: GameObject, event: CollisionEvent): void {
    const other = event.other(owner);
    if (!other.tags.has('enemy') || other.tags.has(SQUASHED)) return;

    // Judge by where the feet were at the start of the step, so clipping a corner while
    // falling still counts as a stomp rather than a side hit.
    const feetBefore = owner.previousPosition.y + owner.size.y;
    if (feetBefore <= other.previousPosition.y + this.stompTolerance) {
      other.tags.add(SQUASHED);
      owner.velocity.y = -this.bounceSpeed;
      owner.grounded = false;
      this.stomps++;
    } else {
      this.events.queue(new PlayerDiedEvent(owner));
    }
  }
}
