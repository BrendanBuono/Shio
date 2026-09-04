import type { GameEvent } from './Event';
import { EventType } from './EventType';

export class GamePausedEvent implements GameEvent {
  readonly type = EventType.GamePaused;
}
