import type { Component, GameObject } from '../core/GameObject';
import { Animation, type AnimationDefinition } from '../graphics/Animation';
import type { SpriteSheet } from '../graphics/SpriteSheet';

export type ActorState = 'idle' | 'walk' | 'jump';

export type ActorAnimations = Record<ActorState, AnimationDefinition>;

export interface SpriteComponentOptions {
  animations: Record<string, AnimationDefinition>;
  /** Animation to start in. Defaults to the first one listed. */
  initialState?: string;
  /** Chooses the animation each step from the owner's state. Without it the state only changes via setState. */
  stateSelector?: (owner: GameObject) => string;
  /** Mirror the sprite to face the direction the owner last moved in. Defaults to true. */
  faceVelocity?: boolean;
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

/** Airborne is jump, moving on the ground is walk, otherwise idle. */
export const actorStateSelector = (owner: GameObject): ActorState =>
  !owner.grounded ? 'jump' : owner.velocity.x !== 0 ? 'walk' : 'idle';

/** Animates and draws an object from a sprite sheet, switching animations by named state. */
export class SpriteComponent implements Component {
  readonly scale: number;
  readonly faceVelocity: boolean;
  private readonly animations = new Map<string, Animation>();
  private readonly stateSelector: ((owner: GameObject) => string) | undefined;
  private state: string;
  private facing: 1 | -1 = 1;

  constructor(
    readonly sheet: SpriteSheet,
    options: SpriteComponentOptions,
  ) {
    const names = Object.keys(options.animations);
    if (names.length === 0) throw new Error(`Sprite '${sheet.name}' needs at least one animation`);
    for (const name of names) {
      this.animations.set(name, new Animation(options.animations[name] as AnimationDefinition));
    }
    this.state = options.initialState ?? (names[0] as string);
    this.requireAnimation(this.state);
    this.stateSelector = options.stateSelector;
    this.faceVelocity = options.faceVelocity ?? true;
    this.scale = options.scale ?? 1;
  }

  get currentState(): string {
    return this.state;
  }

  get currentFrame(): number {
    return this.requireAnimation(this.state).frame;
  }

  get facingLeft(): boolean {
    return this.facing === -1;
  }

  /** Switches animation, restarting it if the state actually changed. */
  setState(state: string): void {
    if (state === this.state) return;
    this.requireAnimation(state).reset();
    this.state = state;
  }

  /** Sizes the owner to one scaled frame so physics and drawing agree. */
  fit(owner: GameObject): this {
    owner.size.set(this.sheet.frameWidth * this.scale, this.sheet.frameHeight * this.scale);
    return this;
  }

  update(owner: GameObject, stepSeconds: number): void {
    if (this.faceVelocity) {
      if (owner.velocity.x > 0) this.facing = 1;
      else if (owner.velocity.x < 0) this.facing = -1;
    }
    if (this.stateSelector) this.setState(this.stateSelector(owner));
    this.requireAnimation(this.state).advance(stepSeconds);
  }

  draw(owner: GameObject, ctx: CanvasRenderingContext2D, alpha: number): void {
    const { x, y } = owner.renderPosition(alpha);
    this.sheet.draw(ctx, this.currentFrame, Math.round(x), Math.round(y), { scale: this.scale, flipX: this.facingLeft });
  }

  private requireAnimation(state: string): Animation {
    const animation = this.animations.get(state);
    if (!animation) throw new Error(`Sprite '${this.sheet.name}' has no animation '${state}'`);
    return animation;
  }
}
