/** A first-in, first-out queue. `peek` and `dequeue` both operate on the front. */
export class Queue<T> {
  private readonly items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  /** Removes and returns the front item. Throws if the queue is empty. */
  dequeue(): T {
    if (this.items.length === 0) {
      throw new RangeError('Queue is empty');
    }
    return this.items.shift() as T;
  }

  /** Returns the front item without removing it, or `undefined` if empty. */
  peek(): T | undefined {
    return this.items[0];
  }

  get size(): number {
    return this.items.length;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }
}
