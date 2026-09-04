import type { Component, GameObject } from '../core/GameObject';

/**
 * Turns a solid object static once it has come to rest, so a dropped crate falls,
 * lands on the floor or on another crate, and then never budges again.
 */
export class SettleComponent implements Component {
  settled = false;

  update(owner: GameObject): void {
    if (this.settled || !owner.grounded || !owner.collider?.solid) return;
    owner.collider = { ...owner.collider, static: true };
    owner.velocity.set(0, 0);
    this.settled = true;
  }
}
