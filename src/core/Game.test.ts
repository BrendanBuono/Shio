// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { ActorDestroyedEvent } from '../events/ActorEvents';
import { EventType } from '../events/EventType';
import { GamePausedEvent } from '../events/GamePausedEvent';
import { GameObject } from './GameObject';
import { Box } from './Box';
import { Game } from './Game';
import { Key } from './KeyboardInput';

function fakeContext() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    imageSmoothingEnabled: true,
  };
}

describe('Game', () => {
  let ctx: ReturnType<typeof fakeContext>;
  let game: Game;
  const press = (code: string) => window.dispatchEvent(new KeyboardEvent('keydown', { code }));
  const release = (code: string) => window.dispatchEvent(new KeyboardEvent('keyup', { code }));

  beforeEach(() => {
    ctx = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ctx as never);
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    game = new Game(canvas);
    game.input.attach(window);
  });

  afterEach(() => {
    game.stop();
    vi.restoreAllMocks();
  });

  it('throws a clear error when the canvas has no 2D context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
    expect(() => new Game(document.createElement('canvas'))).toThrow(/2D rendering context/);
  });

  it('takes its world size from the canvas', () => {
    expect(game.width).toBe(640);
    expect(game.height).toBe(480);
    expect(game.floorY).toBe(480);
  });

  it('raises the floor by the ground height', () => {
    game.groundHeight = 48;
    expect(game.floorY).toBe(432);
    game.resize(800, 600);
    expect(game.floorY).toBe(552);
  });

  it('turns image smoothing off for every render', () => {
    game.render(0, 1 / 60);
    expect(ctx.imageSmoothingEnabled).toBe(false);
  });

  it('toggles pause through the event system when Escape is pressed', () => {
    press(Key.Escape);
    game.step(1 / 60);
    expect(game.paused).toBe(true);
    release(Key.Escape);
    press(Key.Escape);
    game.step(1 / 60);
    expect(game.paused).toBe(false);
  });

  it('toggles pause when a GamePausedEvent is queued directly', () => {
    game.events.queue(new GamePausedEvent());
    game.step(1 / 60);
    expect(game.paused).toBe(true);
    expect(game.events.handlerCount(EventType.GamePaused)).toBe(1);
  });

  it('does not update objects while paused', () => {
    const box = new Box().moveTo(10, 10).addComponent(new PhysicsComponent(game));
    game.add(box);
    game.paused = true;
    game.step(1 / 60);
    expect(box.position.y).toBe(10);
    game.paused = false;
    game.step(1 / 60);
    expect(box.position.y).toBeGreaterThan(10);
  });

  it('survives a keyup with no matching keydown', () => {
    game.add(new Box().moveTo(10, 10).addComponent(new PhysicsComponent(game)));
    release(Key.Left);
    expect(() => game.step(1 / 60)).not.toThrow();
  });

  it('consumes a key press in a single step', () => {
    press(Key.Escape);
    game.step(1 / 60);
    game.step(1 / 60);
    expect(game.paused).toBe(true);
  });

  it('draws every object each render and shows the pause banner', () => {
    game.add(new Box('#123456').moveTo(5, 6));
    game.paused = true;
    game.render(0, 1 / 60);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 640, 480);
    expect(ctx.fillRect).toHaveBeenCalledWith(5, 6, 20, 20);
    expect(ctx.fillText).toHaveBeenCalledWith('PAUSED', 320, 224);
  });

  it('smooths the frame rate across renders', () => {
    game.render(0, 1 / 60);
    expect(game.fps).toBeCloseTo(60);
    game.render(0, 1 / 30);
    expect(game.fps).toBeGreaterThan(30);
    expect(game.fps).toBeLessThan(60);
  });

  it('resolves collisions after objects move and tells both parties', () => {
    const crate = new GameObject().moveTo(100, 432);
    crate.size.set(48, 48);
    crate.collider = { solid: true, static: true };
    const hero = new Box().moveTo(110, 380).addComponent(new PhysicsComponent(game));
    hero.collider = { solid: true };
    const heard: string[] = [];
    hero.addComponent({ update: () => undefined, onCollision: (_o, e) => heard.push(`hero:${e.sideOf(hero)}`) });
    crate.addComponent({ update: () => undefined, onCollision: (_o, e) => heard.push(`crate:${e.sideOf(crate)}`) });
    game.add(crate).add(hero);
    for (let i = 0; i < 60; i++) game.step(1 / 60);
    expect(hero.position.y).toBe(432 - 20);
    expect(hero.grounded).toBe(true);
    expect(heard[0]).toBe('crate:top');
    expect(heard[1]).toBe('hero:bottom');
  });

  it('removes an actor when an ActorDestroyed event is drained', () => {
    const box = new Box();
    game.add(box);
    game.events.queue(new ActorDestroyedEvent(box));
    expect(game.objects).toContain(box);
    game.step(1 / 60);
    expect(game.objects).not.toContain(box);
  });

  it('removes objects', () => {
    const box = new Box();
    game.add(box);
    expect(game.remove(box)).toBe(true);
    expect(game.remove(box)).toBe(false);
    expect(game.objects).toHaveLength(0);
  });
});
