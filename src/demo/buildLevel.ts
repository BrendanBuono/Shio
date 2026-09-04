import type { Game } from '../core/Game';
import type { GameObject } from '../core/GameObject';
import { Label } from '../core/Label';
import type { LevelDefinition, LevelObjectDefinition } from '../core/LevelDefinition';
import type { GameAssets } from '../core/ResourceLoader';
import { TiledGround } from '../core/TiledGround';
import { PlayerRespawnEvent, type PlayerDiedEvent } from '../events/ActorEvents';
import { EventType } from '../events/EventType';
import { makeCrate, makeEnemy, makeHero, requireAsset, SCALE, type Hero } from './actors';

export type ObjectFactory = (game: Game, assets: GameAssets, x: number, y: number) => GameObject;

/** Level object types the demo knows how to build. */
export const objectFactories: Record<string, ObjectFactory> = {
  crate: makeCrate,
  enemy: makeEnemy,
};

export interface BuiltLevel {
  hero: Hero;
  /** Times the player has died since the level was built. */
  readonly deaths: () => number;
}

/** Populates a game from a level definition: ground, objects, hero, HUD and the respawn rule. */
export function buildLevel(game: Game, assets: GameAssets, level: LevelDefinition, factories = objectFactories): BuiltLevel {
  game.levelWidth = level.width;

  const tiles = requireAsset(assets, 'tiles');
  const ground = new TiledGround(game.world, tiles.sheet, { topFrame: 0, fillFrame: 1, scale: SCALE });
  game.groundHeight = ground.tileHeight;
  game.add(ground);

  for (const def of level.objects) {
    game.add(build(game, assets, def, factories));
  }

  const hero = makeHero(game, assets, level.spawn.x, level.spawn.y);
  game.add(hero.object);
  game.follow(hero.object);

  let deaths = 0;
  game.events.register(
    game,
    (event: PlayerDiedEvent) => {
      deaths++;
      event.player.moveTo(level.spawn.x, level.spawn.y);
      event.player.velocity.set(0, 0);
      game.follow(event.player);
      game.events.queue(new PlayerRespawnEvent(event.player));
    },
    EventType.PlayerDied,
  );

  game.add(new Label(() => `${level.name}   Stomps: ${hero.rules.stomps}   Deaths: ${deaths}`).moveTo(8, 24));
  return { hero, deaths: () => deaths };
}

function build(game: Game, assets: GameAssets, def: LevelObjectDefinition, factories: Record<string, ObjectFactory>): GameObject {
  const factory = factories[def.type];
  if (!factory) {
    throw new Error(`Level object type '${def.type}' is not one of: ${Object.keys(factories).join(', ')}`);
  }
  return factory(game, assets, def.x, def.y ?? 0);
}
