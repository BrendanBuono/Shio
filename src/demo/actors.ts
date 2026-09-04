import { EnemyComponent } from '../components/EnemyComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { PlayerInputComponent } from '../components/PlayerInputComponent';
import { PlayerRulesComponent } from '../components/PlayerRulesComponent';
import { SettleComponent } from '../components/SettleComponent';
import { actorAnimations, actorStateSelector, SpriteComponent } from '../components/SpriteComponent';
import type { Game } from '../core/Game';
import { GameObject } from '../core/GameObject';
import type { GameAssets, LoadedSprite } from '../core/ResourceLoader';

export const SCALE = 3;

export function requireAsset(assets: GameAssets, name: string): LoadedSprite {
  const asset = assets.get(name);
  if (!asset) throw new Error(`game.json does not define a sprite named '${name}'`);
  return asset;
}

export interface Hero {
  object: GameObject;
  rules: PlayerRulesComponent;
}

export function makeHero(game: Game, assets: GameAssets, x: number, y: number): Hero {
  const player = requireAsset(assets, 'player');
  const sprite = new SpriteComponent(player.sheet, {
    scale: SCALE,
    animations: actorAnimations('player', player.animations),
    stateSelector: actorStateSelector,
  });
  const rules = new PlayerRulesComponent(game.events);
  const hero = new GameObject().moveTo(x, y);
  sprite.fit(hero);
  hero.tags.add('player');
  hero.collider = { solid: true };
  hero
    .addComponent(new PlayerInputComponent(game.input, {}, game.events))
    .addComponent(new PhysicsComponent(game.world))
    .addComponent(rules)
    .addComponent(sprite);
  return { object: hero, rules };
}

export function makeEnemy(game: Game, assets: GameAssets, x: number, y: number): GameObject {
  const enemy = requireAsset(assets, 'enemy');
  const sprite = new SpriteComponent(enemy.sheet, {
    scale: SCALE,
    animations: enemy.animations,
    initialState: 'walk',
    stateSelector: (owner) => (owner.tags.has('squashed') ? 'squashed' : 'walk'),
  });
  const slime = new GameObject().moveTo(x, y);
  sprite.fit(slime);
  slime.tags.add('enemy');
  slime.collider = { solid: true };
  slime
    .addComponent(new EnemyComponent(game.world, game.events))
    .addComponent(new PhysicsComponent(game.world))
    .addComponent(sprite);
  return slime;
}

export function makeCrate(game: Game, assets: GameAssets, x: number, y: number): GameObject {
  const tiles = requireAsset(assets, 'tiles');
  const sprite = new SpriteComponent(tiles.sheet, {
    scale: SCALE,
    animations: { crate: { frames: [2], fps: 1 } },
    faceVelocity: false,
  });
  const crate = new GameObject().moveTo(x, y);
  sprite.fit(crate);
  crate.tags.add('crate');
  crate.collider = { solid: true };
  crate.addComponent(new PhysicsComponent(game.world)).addComponent(new SettleComponent()).addComponent(sprite);
  return crate;
}
