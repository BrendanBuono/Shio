/** Physical key codes (`KeyboardEvent.code`) used by the engine. */
export const Key = {
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  Space: 'Space',
  Escape: 'Escape',
} as const;

export interface KeyboardInputOptions {
  /** Key codes whose browser default (page scrolling, for instance) should be suppressed. */
  preventDefault?: readonly string[];
}

const defaultPreventDefault: readonly string[] = [Key.Left, Key.Right, Key.Up, Key.Down, Key.Space];

/**
 * Tracks which keys are currently held and which changed since the last `flush`.
 * Game code polls this state each step instead of consuming a queue, so
 * simultaneous keys and out-of-order releases resolve correctly.
 */
export class KeyboardInput {
  private readonly held = new Set<string>();
  private readonly pressed = new Set<string>();
  private readonly released = new Set<string>();
  private readonly preventDefaultFor: ReadonlySet<string>;
  private target: EventTarget | null = null;

  constructor(options: KeyboardInputOptions = {}) {
    this.preventDefaultFor = new Set(options.preventDefault ?? defaultPreventDefault);
  }

  attach(target: EventTarget): void {
    this.detach();
    this.target = target;
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    target.addEventListener('blur', this.onBlur);
  }

  detach(): void {
    if (!this.target) return;
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('blur', this.onBlur);
    this.target = null;
    this.clear();
  }

  isHeld(code: string): boolean {
    return this.held.has(code);
  }

  /** True if the key went down since the last `flush`. */
  wasPressed(code: string): boolean {
    return this.pressed.has(code);
  }

  /** True if the key went up since the last `flush`. */
  wasReleased(code: string): boolean {
    return this.released.has(code);
  }

  /** Clears the per-step pressed and released sets. Call once per simulation step. */
  flush(): void {
    this.pressed.clear();
    this.released.clear();
  }

  /** Forgets every key. Used when the window loses focus, since key-ups will be missed. */
  clear(): void {
    this.held.clear();
    this.flush();
  }

  private readonly onKeyDown = (event: Event): void => {
    const { code, repeat } = event as KeyboardEvent;
    if (this.preventDefaultFor.has(code)) event.preventDefault();
    if (repeat || this.held.has(code)) return;
    this.held.add(code);
    this.pressed.add(code);
  };

  private readonly onKeyUp = (event: Event): void => {
    const { code } = event as KeyboardEvent;
    // A key-up we never saw the key-down for (held while the window gained focus) means nothing.
    if (!this.held.delete(code)) return;
    this.released.add(code);
  };

  private readonly onBlur = (): void => {
    this.clear();
  };
}
