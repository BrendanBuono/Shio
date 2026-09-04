import type { Component, GameObject } from '../core/GameObject';
import { Key, type KeyboardInput } from '../core/KeyboardInput';
import { PlayerJumpedEvent } from '../events/ActorEvents';
import type { EventManager } from '../events/EventManager';

export interface PlayerInputOptions {
  /** Horizontal speed while a direction key is held, in pixels per second. Defaults to 240. */
  walkSpeed?: number;
  /** Initial upward speed of a jump, in pixels per second. Defaults to 520. */
  jumpSpeed?: number;
}

/** Drives an object from the keyboard: left and right to walk, up or space to jump. */
export class PlayerInputComponent implements Component {
  readonly walkSpeed: number;
  readonly jumpSpeed: number;

  constructor(
    private readonly input: KeyboardInput,
    options: PlayerInputOptions = {},
    /** When given, a PlayerJumpedEvent is fired on every jump. */
    private readonly events?: EventManager,
  ) {
    this.walkSpeed = options.walkSpeed ?? 240;
    this.jumpSpeed = options.jumpSpeed ?? 520;
  }

  update(owner: GameObject): void {
    let direction = 0;
    if (this.input.isHeld(Key.Left)) direction -= 1;
    if (this.input.isHeld(Key.Right)) direction += 1;
    owner.velocity.x = direction * this.walkSpeed;

    if (owner.grounded && (this.input.wasPressed(Key.Up) || this.input.wasPressed(Key.Space))) {
      owner.velocity.y = -this.jumpSpeed;
      this.events?.fire(new PlayerJumpedEvent(owner));
    }
  }
}
