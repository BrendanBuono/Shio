// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { Key, KeyboardInput } from './KeyboardInput';

const keyEvent = (type: 'keydown' | 'keyup', code: string, init: KeyboardEventInit = {}) =>
  new KeyboardEvent(type, { code, cancelable: true, ...init });

describe('KeyboardInput', () => {
  let input: KeyboardInput;
  let target: EventTarget;

  beforeEach(() => {
    input = new KeyboardInput();
    target = new EventTarget();
    input.attach(target);
  });

  it('reports a key as held between keydown and keyup', () => {
    target.dispatchEvent(keyEvent('keydown', Key.Right));
    expect(input.isHeld(Key.Right)).toBe(true);
    target.dispatchEvent(keyEvent('keyup', Key.Right));
    expect(input.isHeld(Key.Right)).toBe(false);
  });

  it('reports pressed and released only until the next flush', () => {
    target.dispatchEvent(keyEvent('keydown', Key.Up));
    expect(input.wasPressed(Key.Up)).toBe(true);
    input.flush();
    expect(input.wasPressed(Key.Up)).toBe(false);
    expect(input.isHeld(Key.Up)).toBe(true);
    target.dispatchEvent(keyEvent('keyup', Key.Up));
    expect(input.wasReleased(Key.Up)).toBe(true);
    input.flush();
    expect(input.wasReleased(Key.Up)).toBe(false);
  });

  it('ignores auto-repeat keydown events', () => {
    target.dispatchEvent(keyEvent('keydown', Key.Left));
    input.flush();
    target.dispatchEvent(keyEvent('keydown', Key.Left, { repeat: true }));
    expect(input.wasPressed(Key.Left)).toBe(false);
  });

  it('tracks several keys held at once', () => {
    target.dispatchEvent(keyEvent('keydown', Key.Left));
    target.dispatchEvent(keyEvent('keydown', Key.Right));
    target.dispatchEvent(keyEvent('keyup', Key.Right));
    expect(input.isHeld(Key.Left)).toBe(true);
    expect(input.isHeld(Key.Right)).toBe(false);
  });

  it('ignores a keyup with no matching keydown', () => {
    target.dispatchEvent(keyEvent('keyup', Key.Left));
    expect(input.wasReleased(Key.Left)).toBe(false);
    expect(input.isHeld(Key.Left)).toBe(false);
  });

  it('forgets held keys when the target loses focus', () => {
    target.dispatchEvent(keyEvent('keydown', Key.Right));
    target.dispatchEvent(new Event('blur'));
    expect(input.isHeld(Key.Right)).toBe(false);
  });

  it('prevents the default action for movement keys only', () => {
    const arrow = keyEvent('keydown', Key.Down);
    const letter = keyEvent('keydown', 'KeyA');
    target.dispatchEvent(arrow);
    target.dispatchEvent(letter);
    expect(arrow.defaultPrevented).toBe(true);
    expect(letter.defaultPrevented).toBe(false);
  });

  it('stops listening after detach', () => {
    input.detach();
    target.dispatchEvent(keyEvent('keydown', Key.Right));
    expect(input.isHeld(Key.Right)).toBe(false);
  });
});
