import { describe, expect, it, vi } from 'vitest';
import { GameObject } from '../core/GameObject';
import { SpriteSheet } from '../graphics/SpriteSheet';
import { actorAnimations, actorStateSelector, SpriteComponent } from './SpriteComponent';

const sheet = new SpriteSheet('player', { width: 96, height: 16 } as unknown as HTMLImageElement, { frameWidth: 16, frameHeight: 16 });
const animations = {
  idle: { frames: [0], fps: 1 },
  walk: { frames: [1, 2, 3, 4], fps: 10 },
  jump: { frames: [5], fps: 1 },
};

function actor(scale = 1) {
  const sprite = new SpriteComponent(sheet, { animations, scale, stateSelector: actorStateSelector });
  const obj = new GameObject().addComponent(sprite);
  sprite.fit(obj);
  obj.grounded = true;
  return { obj, sprite };
}

describe('SpriteComponent', () => {
  it('fits the owner to one scaled frame', () => {
    const { obj } = actor(3);
    expect(obj.size).toEqual({ x: 48, y: 48 });
  });

  it('starts in the first animation unless told otherwise', () => {
    expect(new SpriteComponent(sheet, { animations }).currentState).toBe('idle');
    expect(new SpriteComponent(sheet, { animations, initialState: 'jump' }).currentState).toBe('jump');
  });

  it('rejects an empty animation table or an unknown initial state', () => {
    expect(() => new SpriteComponent(sheet, { animations: {} })).toThrow(/at least one animation/);
    expect(() => new SpriteComponent(sheet, { animations, initialState: 'swim' })).toThrow(/no animation 'swim'/);
  });

  it('is idle when grounded and still', () => {
    const { obj, sprite } = actor();
    obj.update(1 / 60);
    expect(sprite.currentState).toBe('idle');
    expect(sprite.currentFrame).toBe(0);
  });

  it('walks when moving on the ground and advances through the walk frames', () => {
    const { obj, sprite } = actor();
    obj.velocity.x = 100;
    obj.update(0.05);
    expect(sprite.currentState).toBe('walk');
    expect(sprite.currentFrame).toBe(1);
    obj.update(0.1);
    expect(sprite.currentFrame).toBe(2);
  });

  it('jumps when airborne regardless of horizontal motion', () => {
    const { obj, sprite } = actor();
    obj.velocity.x = 100;
    obj.grounded = false;
    obj.update(1 / 60);
    expect(sprite.currentState).toBe('jump');
    expect(sprite.currentFrame).toBe(5);
  });

  it('restarts an animation when the state changes', () => {
    const { obj, sprite } = actor();
    obj.velocity.x = 100;
    obj.update(0.25);
    expect(sprite.currentFrame).toBe(3);
    obj.velocity.x = 0;
    obj.update(1 / 60);
    obj.velocity.x = 100;
    obj.update(1 / 60);
    expect(sprite.currentFrame).toBe(1);
  });

  it('keeps facing the last direction moved after stopping', () => {
    const { obj, sprite } = actor();
    obj.velocity.x = -1;
    obj.update(1 / 60);
    expect(sprite.facingLeft).toBe(true);
    obj.velocity.x = 0;
    obj.update(1 / 60);
    expect(sprite.facingLeft).toBe(true);
  });

  it('can be told not to face its velocity', () => {
    const sprite = new SpriteComponent(sheet, { animations, faceVelocity: false });
    const obj = new GameObject().addComponent(sprite);
    obj.velocity.x = -1;
    obj.update(1 / 60);
    expect(sprite.facingLeft).toBe(false);
  });

  it('setState switches and restarts, and rejects unknown states', () => {
    const sprite = new SpriteComponent(sheet, { animations });
    const obj = new GameObject().addComponent(sprite);
    sprite.setState('walk');
    obj.update(0.15);
    expect(sprite.currentFrame).toBe(2);
    sprite.setState('walk');
    expect(sprite.currentFrame).toBe(2);
    sprite.setState('jump');
    expect(sprite.currentFrame).toBe(5);
    expect(() => sprite.setState('swim')).toThrow(/no animation 'swim'/);
  });

  it('draws the current frame at the interpolated position, flipped when facing left', () => {
    const { obj, sprite } = actor(2);
    obj.moveTo(10, 20);
    obj.velocity.x = -1;
    obj.update(1 / 60);
    const draw = vi.spyOn(sheet, 'draw').mockImplementation(() => undefined);
    obj.draw({} as CanvasRenderingContext2D, 1);
    expect(draw).toHaveBeenCalledWith({}, 1, 10, 20, { scale: 2, flipX: true });
    expect(sprite.currentState).toBe('walk');
    draw.mockRestore();
  });
});

describe('actorAnimations', () => {
  it('returns the three actor animations', () => {
    expect(actorAnimations('p', { ...animations, extra: { frames: [0], fps: 1 } })).toEqual(animations);
  });

  it('names every missing animation', () => {
    expect(() => actorAnimations('p', { idle: animations.idle })).toThrow("Sprite 'p' is missing animations: walk, jump");
  });
});
