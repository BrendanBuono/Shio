import { describe, expect, it } from 'vitest';
import { Queue } from './Queue';

describe('Queue', () => {
  it('dequeues in insertion order', () => {
    const q = new Queue<number>();
    for (let i = 0; i < 5; i++) q.enqueue(i);
    expect([q.dequeue(), q.dequeue(), q.dequeue(), q.dequeue(), q.dequeue()]).toEqual([0, 1, 2, 3, 4]);
    expect(q.isEmpty).toBe(true);
  });

  it('peek returns the same item dequeue will return next', () => {
    const q = new Queue<string>();
    q.enqueue('first');
    q.enqueue('last');
    expect(q.peek()).toBe('first');
    expect(q.dequeue()).toBe('first');
  });

  it('peek does not remove the item', () => {
    const q = new Queue<number>();
    q.enqueue(1);
    q.peek();
    expect(q.size).toBe(1);
  });

  it('peek on an empty queue is undefined and dequeue throws', () => {
    const q = new Queue<number>();
    expect(q.peek()).toBeUndefined();
    expect(() => q.dequeue()).toThrow(RangeError);
  });
});
