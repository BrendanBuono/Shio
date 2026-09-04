export type SoundName = 'jump' | 'stomp' | 'die';

interface Patch {
  type: OscillatorType;
  from: number;
  to: number;
  seconds: number;
  volume: number;
}

/** Each effect is a single oscillator sweeping between two pitches under a decaying envelope. */
const patches: Record<SoundName, Patch> = {
  jump: { type: 'square', from: 300, to: 700, seconds: 0.12, volume: 0.08 },
  stomp: { type: 'triangle', from: 220, to: 70, seconds: 0.16, volume: 0.15 },
  die: { type: 'sawtooth', from: 440, to: 90, seconds: 0.45, volume: 0.12 },
};

const defaultCreateContext = (): AudioContext | null => (typeof AudioContext === 'undefined' ? null : new AudioContext());

/**
 * Plays short synthesized effects. Browsers only allow audio after a user gesture,
 * so `attach` waits for the first key or pointer press before creating the context.
 */
export class SoundPlayer {
  muted = false;
  /** Effects actually started, for tests and debugging. */
  played = 0;
  private context: AudioContext | null = null;
  private target: EventTarget | null = null;

  constructor(private readonly createContext: () => AudioContext | null = defaultCreateContext) {}

  get isReady(): boolean {
    return this.context !== null && this.context.state === 'running';
  }

  attach(target: EventTarget): void {
    this.detach();
    this.target = target;
    target.addEventListener('keydown', this.unlock);
    target.addEventListener('pointerdown', this.unlock);
  }

  detach(): void {
    if (!this.target) return;
    this.target.removeEventListener('keydown', this.unlock);
    this.target.removeEventListener('pointerdown', this.unlock);
    this.target = null;
  }

  /** Creates or resumes the audio context. Safe to call repeatedly. */
  readonly unlock = (): void => {
    this.context ??= this.createContext();
    if (this.context && this.context.state === 'suspended') {
      void this.context.resume();
    }
  };

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  /** Starts an effect. Returns false when muted or when audio is not yet allowed. */
  play(name: SoundName): boolean {
    if (this.muted || !this.context || this.context.state !== 'running') return false;
    const patch = patches[name];
    const ctx = this.context;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = patch.type;
    oscillator.frequency.setValueAtTime(patch.from, now);
    oscillator.frequency.exponentialRampToValueAtTime(patch.to, now + patch.seconds);
    gain.gain.setValueAtTime(patch.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + patch.seconds);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + patch.seconds);
    this.played++;
    return true;
  }
}
