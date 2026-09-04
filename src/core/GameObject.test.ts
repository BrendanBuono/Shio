import { describe, expect, it, vi } from 'vitest';
import { CollisionEvent } from '../events/CollisionEvent';
import type { Component } from './GameObject';
import { GameObject } from './GameObject';

describe('GameObject', () => {
  it('gets a unique id by default', () => {
    expect(new GameObject().id).not.toBe(new GameObject().id);
  });

  it('updates components in the order they were added with itself and the step', () => {
    const calls: string[] = [];
    const a: Component = { update: () => calls.push('a') };
    const b: Component = { update: vi.fn(() => calls.push('b')) };
    const obj = new GameObject().addComponent(a).addComponent(b);
    obj.update(0.5);
    expect(calls).toEqual(['a', 'b']);
    expect(b.update).toHaveBeenCalledWith(obj, 0.5);
  });

  it('interpolates render position between the previous and current step', () => {
    const obj = new GameObject().moveTo(0, 0);
    obj.addComponent({ update: (o) => o.position.set(10, 20) });
    obj.update(1);
    expect(obj.renderPosition(0)).toEqual({ x: 0, y: 0 });
    expect(obj.renderPosition(0.5)).toEqual({ x: 5, y: 10 });
  });

  it('draws components that can draw, in order, and skips those that cannot', () => {
    const calls: string[] = [];
    const obj = new GameObject()
      .addComponent({ update: () => undefined })
      .addComponent({ update: () => undefined, draw: () => calls.push('a') })
      .addComponent({ update: () => undefined, draw: vi.fn(() => calls.push('b')) });
    const ctx = {} as CanvasRenderingContext2D;
    obj.draw(ctx, 0.5);
    expect(calls).toEqual(['a', 'b']);
  });

  it('exposes its bounds as a rectangle', () => {
    const obj = new GameObject().moveTo(3, 4);
    obj.size.set(5, 6);
    expect(obj.bounds).toEqual({ x: 3, y: 4, width: 5, height: 6 });
  });

  it('forwards collisions to components that listen', () => {
    const obj = new GameObject();
    const other = new GameObject();
    const listener = vi.fn();
    obj.addComponent({ update: () => undefined }).addComponent({ update: () => undefined, onCollision: listener });
    const event = new CollisionEvent(obj, other, 'x', 'left');
    obj.onCollision(event);
    expect(listener).toHaveBeenCalledWith(obj, event);
  });

  it('moveTo resets interpolation', () => {
    const obj = new GameObject().moveTo(100, 100);
    expect(obj.renderPosition(0)).toEqual({ x: 100, y: 100 });
  });
});
