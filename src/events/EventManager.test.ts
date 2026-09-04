import { describe, expect, it, vi } from 'vitest';
import type { GameEvent } from './Event';
import { EventManager } from './EventManager';
import { EventType } from './EventType';
import { GamePausedEvent } from './GamePausedEvent';

const collision: GameEvent = { type: EventType.Collision };

describe('EventManager', () => {
  describe('register and fire', () => {
    it('invokes the handler with `this` bound to its owner', () => {
      const em = new EventManager();
      const owner = {
        paused: false,
        onPause(this: { paused: boolean }) {
          this.paused = !this.paused;
        },
      };
      em.register(owner, owner.onPause, EventType.GamePaused);
      em.fire(new GamePausedEvent());
      expect(owner.paused).toBe(true);
    });

    it('passes the event to the handler', () => {
      const em = new EventManager();
      const handler = vi.fn();
      em.register(null, handler, EventType.Collision);
      em.fire(collision);
      expect(handler).toHaveBeenCalledWith(collision);
    });

    it('only fires handlers registered for the event type', () => {
      const em = new EventManager();
      const handler = vi.fn();
      em.register(null, handler, EventType.PlayerDied);
      em.fire(collision);
      expect(handler).not.toHaveBeenCalled();
    });

    it('tolerates a handler unregistering itself during dispatch', () => {
      const em = new EventManager();
      const second = vi.fn();
      const first = vi.fn(() => em.unregister(first, EventType.Collision));
      em.register(null, first, EventType.Collision);
      em.register(null, second, EventType.Collision);
      em.fire(collision);
      expect(second).toHaveBeenCalledTimes(1);
      expect(em.handlerCount(EventType.Collision)).toBe(1);
    });
  });

  describe('unregister', () => {
    it('removes only the given handler', () => {
      const em = new EventManager();
      const a = vi.fn();
      const b = vi.fn();
      em.register(null, a, EventType.Collision);
      em.register(null, b, EventType.Collision);
      expect(em.unregister(a, EventType.Collision)).toBe(true);
      em.fire(collision);
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledTimes(1);
    });

    it('does not remove anything when the handler is unknown', () => {
      const em = new EventManager();
      const a = vi.fn();
      em.register(null, a, EventType.Collision);
      expect(em.unregister(vi.fn(), EventType.Collision)).toBe(false);
      expect(em.handlerCount(EventType.Collision)).toBe(1);
    });
  });

  describe('queue and update', () => {
    it('fires every queued event in order on update', () => {
      const em = new EventManager();
      const seen: number[] = [];
      em.register(null, (e: GameEvent & { n: number }) => seen.push(e.n), EventType.Collision);
      for (let n = 0; n < 6; n++) em.queue({ type: EventType.Collision, n } as GameEvent);
      expect(em.update()).toBe(6);
      expect(seen).toEqual([0, 1, 2, 3, 4, 5]);
      expect(em.pending).toBe(0);
    });

    it('stops after the time budget and resumes on the next update', () => {
      let now = 0;
      const em = new EventManager({ now: () => now });
      const handler = vi.fn(() => {
        now += 3;
      });
      em.register(null, handler, EventType.Collision);
      for (let n = 0; n < 5; n++) em.queue(collision);
      expect(em.update(5)).toBe(2);
      expect(em.pending).toBe(3);
      expect(em.update()).toBe(3);
    });

    it('update on an empty queue fires nothing', () => {
      expect(new EventManager().update()).toBe(0);
    });
  });
});
