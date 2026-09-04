import { EnemyComponent } from './components/EnemyComponent';
import { PhysicsComponent } from './components/PhysicsComponent';
import { PlayerInputComponent } from './components/PlayerInputComponent';
import { PlayerRulesComponent } from './components/PlayerRulesComponent';
import { actorAnimations, actorStateSelector, SpriteComponent } from './components/SpriteComponent';
import { Game } from './core/Game';
import { GameObject } from './core/GameObject';
import { Label } from './core/Label';
import { ResourceLoader, type LoadedSprite } from './core/ResourceLoader';
import { TiledGround } from './core/TiledGround';
import { PlayerRespawnEvent, type PlayerDiedEvent } from './events/ActorEvents';
import { EventType } from './events/EventType';
import { Vector2 } from './physics/Vector2';

const SCALE = 3;
const SPAWN = new Vector2(40, 40);

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

function makeHero(game: Game, player: LoadedSprite): { hero: GameObject; rules: PlayerRulesComponent } {
  const sprite = new SpriteComponent(player.sheet, {
    scale: SCALE,
    animations: actorAnimations('player', player.animations),
    stateSelector: actorStateSelector,
  });
  const rules = new PlayerRulesComponent(game.events);
  const hero = new GameObject().moveTo(SPAWN.x, SPAWN.y);
  sprite.fit(hero);
  hero.tags.add('player');
  hero.collider = { solid: true };
  hero
    .addComponent(new PlayerInputComponent(game.input))
    .addComponent(new PhysicsComponent(game))
    .addComponent(rules)
    .addComponent(sprite);
  return { hero, rules };
}

function makeEnemy(game: Game, enemy: LoadedSprite, x: number): GameObject {
  const sprite = new SpriteComponent(enemy.sheet, {
    scale: SCALE,
    animations: enemy.animations,
    initialState: 'walk',
    stateSelector: (owner) => (owner.tags.has('squashed') ? 'squashed' : 'walk'),
  });
  const slime = new GameObject().moveTo(x, 0);
  sprite.fit(slime);
  slime.tags.add('enemy');
  slime.collider = { solid: true };
  slime
    .addComponent(new EnemyComponent(game, game.events))
    .addComponent(new PhysicsComponent(game))
    .addComponent(sprite);
  return slime;
}

function makeCrate(game: Game, tiles: LoadedSprite, x: number): GameObject {
  const sprite = new SpriteComponent(tiles.sheet, { scale: SCALE, animations: { crate: { frames: [2], fps: 1 } }, faceVelocity: false });
  const crate = new GameObject().moveTo(x, 0);
  sprite.fit(crate);
  crate.tags.add('crate');
  crate.collider = { solid: true, static: true };
  crate.addComponent(new PhysicsComponent(game)).addComponent(sprite);
  return crate;
}

async function main(): Promise<void> {
  const game = new Game(requireCanvas());
  const assets = await new ResourceLoader().loadGame(`${import.meta.env.BASE_URL}game/game.json`);
  const tiles = requireAsset(assets, 'tiles');

  const ground = new TiledGround(game, tiles.sheet, { topFrame: 0, fillFrame: 1, scale: SCALE });
  game.groundHeight = ground.tileHeight;
  game.add(ground);

  const { hero, rules } = makeHero(game, requireAsset(assets, 'player'));
  game.add(makeCrate(game, tiles, 320));
  game.add(makeCrate(game, tiles, 320 + 16 * SCALE));
  game.add(makeEnemy(game, requireAsset(assets, 'enemy'), 640));
  game.add(hero);

  let deaths = 0;
  game.events.register(game, (event: PlayerDiedEvent) => {
    deaths++;
    event.player.moveTo(SPAWN.x, SPAWN.y);
    event.player.velocity.set(0, 0);
    game.events.queue(new PlayerRespawnEvent(event.player));
  }, EventType.PlayerDied);

  game.add(new Label(() => `Stomps: ${rules.stomps}   Deaths: ${deaths}`).moveTo(8, 24));

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
