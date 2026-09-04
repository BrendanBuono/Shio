// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { GameObject } from '../core/GameObject';
import { Key, KeyboardInput } from '../core/KeyboardInput';
import { PlayerInputComponent } from './PlayerInputComponent';

describe('PlayerInputComponent', () => {
  let input: KeyboardInput;
  let target: EventTarget;
  let obj: GameObject;
  const press = (code: string) => target.dispatchEvent(new KeyboardEvent('keydown', { code }));
  const release = (code: string) => target.dispatchEvent(new KeyboardEvent('keyup', { code }));

  beforeEach(() => {
    input = new KeyboardInput();
    target = new EventTarget();
    input.attach(target);
    obj = new GameObject().addComponent(new PlayerInputComponent(input, { walkSpeed: 100, jumpSpeed: 50 }));
  });

  it('walks while a direction is held and stops on release', () => {
    press(Key.Right);
    obj.update(1);
    expect(obj.velocity.x).toBe(100);
    release(Key.Right);
    obj.update(1);
    expect(obj.velocity.x).toBe(0);
  });

  it('holding both directions cancels out', () => {
    press(Key.Left);
    press(Key.Right);
    obj.update(1);
    expect(obj.velocity.x).toBe(0);
  });

  it('releasing one key while the other is still held keeps the held direction', () => {
    press(Key.Left);
    press(Key.Right);
    release(Key.Right);
    obj.update(1);
    expect(obj.velocity.x).toBe(-100);
  });

  it('jumps only when grounded', () => {
    press(Key.Up);
    obj.update(1);
    expect(obj.velocity.y).toBe(0);
    obj.grounded = true;
    obj.update(1);
    expect(obj.velocity.y).toBe(-50);
  });

  it('jumps once per press, not once per step while held', () => {
    obj.grounded = true;
    press(Key.Space);
    obj.update(1);
    input.flush();
    obj.velocity.y = 0;
    obj.update(1);
    expect(obj.velocity.y).toBe(0);
  });
});
