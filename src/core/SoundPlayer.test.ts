import { describe, expect, it, vi } from 'vitest';
import { SoundPlayer } from './SoundPlayer';

function fakeContext(state: AudioContextState = 'running') {
  const oscillators: Array<{ type: string; started: boolean; stopped: boolean }> = [];
  const ctx = {
    state,
    currentTime: 1,
    destination: {},
    resume: vi.fn(async () => {
      ctx.state = 'running';
    }),
    createOscillator: () => {
      const osc = {
        type: 'sine',
        started: false,
        stopped: false,
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: () => (osc.started = true),
        stop: () => (osc.stopped = true),
      };
      oscillators.push(osc);
      return osc;
    },
    createGain: () => ({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }),
  };
  return { ctx: ctx as unknown as AudioContext, oscillators, raw: ctx };
}

describe('SoundPlayer', () => {
  it('does nothing until unlocked by a user gesture', () => {
    const { ctx } = fakeContext();
    const create = vi.fn(() => ctx);
    const player = new SoundPlayer(create);
    expect(player.play('jump')).toBe(false);
    expect(create).not.toHaveBeenCalled();
    player.unlock();
    expect(player.play('jump')).toBe(true);
    expect(player.played).toBe(1);
  });

  it('unlocks on the first keydown after attach and resumes a suspended context', () => {
    const { ctx, raw } = fakeContext('suspended');
    const player = new SoundPlayer(() => ctx);
    const target = new EventTarget();
    player.attach(target);
    target.dispatchEvent(new Event('keydown'));
    expect(raw.resume).toHaveBeenCalledTimes(1);
    expect(player.isReady).toBe(true);
  });

  it('starts and stops one oscillator per effect with the patch waveform', () => {
    const { ctx, oscillators } = fakeContext();
    const player = new SoundPlayer(() => ctx);
    player.unlock();
    player.play('stomp');
    player.play('die');
    expect(oscillators.map((o) => o.type)).toEqual(['triangle', 'sawtooth']);
    expect(oscillators.every((o) => o.started && o.stopped)).toBe(true);
  });

  it('plays nothing while muted', () => {
    const { ctx } = fakeContext();
    const player = new SoundPlayer(() => ctx);
    player.unlock();
    expect(player.toggleMute()).toBe(true);
    expect(player.play('jump')).toBe(false);
    expect(player.toggleMute()).toBe(false);
    expect(player.play('jump')).toBe(true);
  });

  it('copes with a platform that has no audio at all', () => {
    const player = new SoundPlayer(() => null);
    player.unlock();
    expect(player.isReady).toBe(false);
    expect(player.play('jump')).toBe(false);
  });
});
