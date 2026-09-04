import type { GameObject } from '../core/GameObject';
import type { GameEvent } from './Event';
import { EventType } from './EventType';

export class ActorCreatedEvent implements GameEvent {
  readonly type = EventType.ActorCreated;
  constructor(readonly actor: GameObject) {}
}

/** Asks the game to remove an object at the next event drain. */
export class ActorDestroyedEvent implements GameEvent {
  readonly type = EventType.ActorDestroyed;
  constructor(readonly actor: GameObject) {}
}

export class PlayerDiedEvent implements GameEvent {
  readonly type = EventType.PlayerDied;
  constructor(readonly player: GameObject) {}
}

export class PlayerRespawnEvent implements GameEvent {
  readonly type = EventType.PlayerRespawn;
  constructor(readonly player: GameObject) {}
}
