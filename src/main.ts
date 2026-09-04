import { PhysicsComponent } from './components/PhysicsComponent';
import { PlayerInputComponent } from './components/PlayerInputComponent';
import { actorAnimations, SpriteComponent } from './components/SpriteComponent';
import { Game } from './core/Game';
import { GameObject } from './core/GameObject';
import { ResourceLoader } from './core/ResourceLoader';
import { TiledGround } from './core/TiledGround';

const SCALE = 3;

function requireCanvas(): HTMLCanvasElement {
  const canvas = document.getElementById('game');
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected a <canvas id="game"> element');
  return canvas;
}

function requireAsset<T>(assets: ReadonlyMap<string, T>, name: string): T {
  const asset = assets.get(name);
  if (!asset) throw new Error(`game.json does not define a sprite named '${name}'`);
  return asset;
}

async function main(): Promise<void> {
  const canvas = requireCanvas();
  const game = new Game(canvas);
  const assets = await new ResourceLoader().loadGame(`${import.meta.env.BASE_URL}game/game.json`);
  const player = requireAsset(assets, 'player');
  const tiles = requireAsset(assets, 'tiles');

  const ground = new TiledGround(game, tiles.sheet, { topFrame: 0, fillFrame: 1, scale: SCALE });
  game.groundHeight = ground.tileHeight;
  game.add(ground);

  const sprite = new SpriteComponent(player.sheet, { scale: SCALE, animations: actorAnimations('player', player.animations) });
  const hero = new GameObject().moveTo(40, 40);
  sprite.fit(hero);
  hero.addComponent(new PlayerInputComponent(game.input)).addComponent(new PhysicsComponent(game)).addComponent(sprite);
  game.add(hero);

  game.start();
  window.shio = game;
}

function showError(error: unknown): void {
  console.error(error);
  const ctx = requireCanvas().getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText(`Failed to start: ${error instanceof Error ? error.message : String(error)}`, 16, 32);
}

// Handy for poking at the running game from the browser console.
declare global {
  interface Window {
    shio?: Game;
  }
}

main().catch(showError);
