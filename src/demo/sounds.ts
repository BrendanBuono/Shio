import type { EventManager } from '../events/EventManager';
import { EventType } from '../events/EventType';
import type { SoundPlayer } from '../core/SoundPlayer';

/** Plays an effect for each gameplay event worth hearing. */
export function wireSounds(events: EventManager, sound: SoundPlayer): void {
  events.register(sound, () => sound.play('jump'), EventType.PlayerJumped);
  events.register(sound, () => sound.play('stomp'), EventType.EnemyStomped);
  events.register(sound, () => sound.play('die'), EventType.PlayerDied);
}
