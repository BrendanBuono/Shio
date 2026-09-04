import { describe, expect, it } from 'vitest';
import { GameObject } from '../core/GameObject';
import { SoundPlayer } from '../core/SoundPlayer';
import { EnemyStompedEvent, PlayerDiedEvent, PlayerJumpedEvent } from '../events/ActorEvents';
import { EventManager } from '../events/EventManager';
import { wireSounds } from './sounds';

describe('wireSounds', () => {
  it('plays jump, stomp and die for their events', () => {
    const events = new EventManager();
    const sound = new SoundPlayer(() => null);
    const played: string[] = [];
    sound.play = (name) => {
      played.push(name);
      return true;
    };
    wireSounds(events, sound);
    const hero = new GameObject();
    events.fire(new PlayerJumpedEvent(hero));
    events.fire(new EnemyStompedEvent(new GameObject(), hero));
    events.fire(new PlayerDiedEvent(hero));
    expect(played).toEqual(['jump', 'stomp', 'die']);
  });
});
