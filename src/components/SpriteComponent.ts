import type { Component, GameObject } from '../core/GameObject';
import { Animation, type AnimationDefinition } from '../graphics/Animation';
import type { SpriteSheet } from '../graphics/SpriteSheet';

export type ActorState = 'idle' | 'walk' | 'jump';

export type ActorAnimations = Record<ActorState, AnimationDefinition>;

export interface SpriteComponentOptions {
  animations: ActorAnimations;
  /** Integer zoom. Defaults to 1. */
  scale?: number;
}

const actorStates: readonly ActorState[] = ['idle', 'walk', 'jump'];

/** Picks the idle, walk and jump animations out of a sprite's animation table, or explains what is missing. */
export function actorAnimations(sheetName: string, animations: Record<string, AnimationDefinition>): ActorAnimations {
  const missing = actorStates.filter((state) => animations[state] === undefined);
  if (missing.length > 0) {
    throw new Error(`Sprite '${sheetName}' is missing animations: ${missing.join(', ')}`);
  }
  return { idle: animations.idle as AnimationDefinition, walk: animations.walk as AnimationDefinition, jump: animations.jump as AnimationDefinition };
}

/**
 * Animates and draws an actor from a sprite sheet. The state comes from the owner's
 * motion: airborne is jump, moving on the ground is walk, otherwise idle. The sprite
 * faces the direction it last moved in.
 */
export class SpriteComponent implements Component {
  readonly scale: number;
  private readonly animations: Record<ActorState, Animation>;
  private state: ActorState = 'idle';
  private facing: 1 | -1 = 1;

  constructor(
    readonly sheet: SpriteSheet,
    options: SpriteComponentOptions,
  ) {
    this.scale = options.scale ?? 1;
    this.animations = {
      idle: new Animation(options.animations.idle),
      walk: new Animation(options.animations.walk),
      jump: new Animation(options.animations.jump),
    };
  }

  get currentState(): ActorState {
    return this.state;
  }

  get currentFrame(): number {
    return this.animations[this.state].frame;
  }

  get facingLeft(): boolean {
    return this.facing === -1;
  }

  /** Sizes the owner to one scaled frame so physics and drawing agree. */
  fit(owner: GameObject): this {
    owner.size.set(this.sheet.frameWidth * this.scale, this.sheet.frameHeight * this.scale);
    return this;
  }

  update(owner: GameObject, stepSeconds: number): void {
    if (owner.velocity.x > 0) this.facing = 1;
    else if (owner.velocity.x < 0) this.facing = -1;

    const next: ActorState = !owner.grounded ? 'jump' : owner.velocity.x !== 0 ? 'walk' : 'idle';
    if (next !== this.state) {
      this.state = next;
      this.animations[next].reset();
    }
    this.animations[this.state].advance(stepSeconds);
  }

  draw(owner: GameObject, ctx: CanvasRenderingContext2D, alpha: number): void {
    const { x, y } = owner.renderPosition(alpha);
    this.sheet.draw(ctx, this.currentFrame, Math.round(x), Math.round(y), { scale: this.scale, flipX: this.facingLeft });
  }
}
