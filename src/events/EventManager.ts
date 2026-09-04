import { Queue } from '../utility/Queue';
import type { GameEvent } from './Event';
import type { EventType } from './EventType';

export type EventHandler<E extends GameEvent = GameEvent> = (event: E) => void;

export interface Clock {
  now(): number;
}

interface Registration {
  owner: unknown;
  handler: EventHandler<never>;
}

const defaultClock: Clock = { now: () => performance.now() };

/**
 * Registers handlers per event type and dispatches queued events with a time budget.
 * Handlers are invoked with `this` bound to the owner they were registered with.
 */
export class EventManager {
  private readonly handlers = new Map<EventType, Registration[]>();
  private readonly queued = new Queue<GameEvent>();

  constructor(private readonly clock: Clock = defaultClock) {}

  register<E extends GameEvent>(owner: unknown, handler: EventHandler<E>, type: E['type']): void {
    const list = this.handlers.get(type) ?? [];
    list.push({ owner, handler });
    this.handlers.set(type, list);
  }

  /** Removes a previously registered handler. Returns `false` if it was not registered. */
  unregister(handler: EventHandler<never>, type: EventType): boolean {
    const list = this.handlers.get(type);
    if (!list) return false;
    const index = list.findIndex((r) => r.handler === handler);
    if (index === -1) return false;
    list.splice(index, 1);
    return true;
  }

  handlerCount(type: EventType): number {
    return this.handlers.get(type)?.length ?? 0;
  }

  /** Dispatches an event synchronously to every handler registered for its type. */
  fire(event: GameEvent): void {
    const list = this.handlers.get(event.type);
    if (!list) return;
    // Iterate a copy so handlers may register or unregister during dispatch.
    for (const { owner, handler } of [...list]) {
      (handler as EventHandler).call(owner, event);
    }
  }

  /** Defers an event until the next `update`. */
  queue(event: GameEvent): void {
    this.queued.enqueue(event);
  }

  get pending(): number {
    return this.queued.size;
  }

  /**
   * Fires queued events in order until the queue is empty or `maxMillis` has elapsed.
   * Returns the number of events fired. Events left over are fired on a later update.
   */
  update(maxMillis = Number.POSITIVE_INFINITY): number {
    const start = this.clock.now();
    let fired = 0;
    while (!this.queued.isEmpty) {
      this.fire(this.queued.dequeue());
      fired++;
      if (this.clock.now() - start > maxMillis) break;
    }
    return fired;
  }
}
