// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Game } from '../core/Game';
import type { GameAssets } from '../core/ResourceLoader';
import { SpriteSheet } from '../graphics/SpriteSheet';
import { PlayerDiedEvent } from '../events/ActorEvents';
import { buildLevel } from './buildLevel';

function fakeAssets(): GameAssets {
  const image = (frames: number) => ({ width: 16 * frames, height: 16 }) as unknown as HTMLImageElement;
  const sheet = (name: string, frames: number) => new SpriteSheet(name, image(frames), { frameWidth: 16, frameHeight: 16 });
  return new Map([
    ['player', { sheet: sheet('player', 6), animations: { idle: { frames: [0], fps: 1 }, walk: { frames: [1], fps: 1 }, jump: { frames: [5], fps: 1 } } }],
    ['enemy', { sheet: sheet('enemy', 3), animations: { walk: { frames: [0, 1], fps: 4 }, squashed: { frames: [2], fps: 1 } } }],
    ['tiles', { sheet: sheet('tiles', 3), animations: {} }],
  ]);
}

const level = { name: 'test', width: 2000, spawn: { x: 40, y: 40 }, objects: [{ type: 'crate', x: 300 }, { type: 'enemy', x: 600, y: 10 }] };

describe('buildLevel', () => {
  let game: Game;

  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({}) as never);
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    game = new Game(canvas);
  });

  afterEach(() => vi.restoreAllMocks());

  it('builds ground, every object, the hero and a HUD label, and sizes the world', () => {
    const built = buildLevel(game, fakeAssets(), level);
    expect(game.world.width).toBe(2000);
    expect(game.groundHeight).toBe(48);
    const tags = game.objects.map((o) => [...o.tags].join(',') || o.constructor.name);
    expect(tags).toEqual(['TiledGround', 'crate', 'enemy', 'player', 'Label']);
    expect(built.hero.object.position).toEqual({ x: 40, y: 40 });
    expect(game.objects.find((o) => o.tags.has('enemy'))?.position.y).toBe(10);
  });

  it('respawns the hero at the spawn point when the player dies and counts it', () => {
    const built = buildLevel(game, fakeAssets(), level);
    const hero = built.hero.object;
    hero.moveTo(900, 200);
    hero.velocity.set(50, 50);
    game.events.queue(new PlayerDiedEvent(hero));
    game.step(1 / 60);
    expect(hero.position.x).toBe(40);
    expect(hero.position.y).toBeCloseTo(40, 0);
    expect(hero.velocity.x).toBe(0);
    expect(built.deaths()).toBe(1);
  });

  it('settles crates into static solids once they land', () => {
    buildLevel(game, fakeAssets(), level);
    const crate = game.objects.find((o) => o.tags.has('crate'));
    expect(crate?.collider?.static).toBeUndefined();
    for (let i = 0; i < 120; i++) game.step(1 / 60);
    expect(crate?.collider?.static).toBe(true);
    expect(crate?.position.y).toBe(game.floorY - 48);
  });

  it('names an unknown object type and the ones it knows', () => {
    expect(() => buildLevel(game, fakeAssets(), { ...level, objects: [{ type: 'dragon', x: 1 }] })).toThrow(
      "Level object type 'dragon' is not one of: crate, enemy",
    );
  });
});
