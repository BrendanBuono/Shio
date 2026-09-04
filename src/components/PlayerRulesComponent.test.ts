import { describe, expect, it } from 'vitest';
import { GameObject } from '../core/GameObject';
import type { PlayerDiedEvent } from '../events/ActorEvents';
import { CollisionEvent } from '../events/CollisionEvent';
import { EventManager } from '../events/EventManager';
import { EventType } from '../events/EventType';
import { SQUASHED } from './EnemyComponent';
import { PlayerRulesComponent } from './PlayerRulesComponent';

function setup() {
  const events = new EventManager();
  const deaths: GameObject[] = [];
  events.register(null, (e: PlayerDiedEvent) => deaths.push(e.player), EventType.PlayerDied);
  const rules = new PlayerRulesComponent(events, { bounceSpeed: 100 });
  const hero = new GameObject().addComponent(rules);
  hero.size.set(20, 20);
  hero.tags.add('player');
  const enemy = new GameObject().moveTo(100, 100);
  enemy.size.set(20, 20);
  enemy.tags.add('enemy');
  return { events, deaths, rules, hero, enemy };
}

describe('PlayerRulesComponent', () => {
  it('stomps an enemy when the feet started above its top, and bounces', () => {
    const { rules, hero, enemy, events, deaths } = setup();
    hero.moveTo(100, 75);
    hero.position.y = 85;
    hero.grounded = true;
    hero.onCollision(new CollisionEvent(hero, enemy, 'y', 'bottom'));
    expect(enemy.tags.has(SQUASHED)).toBe(true);
    expect(hero.velocity.y).toBe(-100);
    expect(hero.grounded).toBe(false);
    expect(rules.stomps).toBe(1);
    events.update();
    expect(deaths).toEqual([]);
  });

  it('still counts a stomp within the tolerance even if the boxes met on the x axis', () => {
    const { hero, enemy } = setup();
    hero.moveTo(85, 84);
    hero.onCollision(new CollisionEvent(hero, enemy, 'x', 'right'));
    expect(enemy.tags.has(SQUASHED)).toBe(true);
  });

  it('dies when touching an enemy from the side', () => {
    const { hero, enemy, events, deaths } = setup();
    hero.moveTo(85, 100);
    hero.onCollision(new CollisionEvent(hero, enemy, 'x', 'right'));
    expect(enemy.tags.has(SQUASHED)).toBe(false);
    events.update();
    expect(deaths).toEqual([hero]);
  });

  it('ignores squashed enemies and things that are not enemies', () => {
    const { hero, enemy, events, deaths } = setup();
    hero.moveTo(85, 100);
    enemy.tags.add(SQUASHED);
    hero.onCollision(new CollisionEvent(hero, enemy, 'x', 'right'));
    const crate = new GameObject();
    hero.onCollision(new CollisionEvent(crate, hero, 'x', 'right'));
    events.update();
    expect(deaths).toEqual([]);
  });
});
