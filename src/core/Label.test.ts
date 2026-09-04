import { describe, expect, it, vi } from 'vitest';
import { Label } from './Label';

describe('Label', () => {
  it('draws the current text at its position in its style', () => {
    let n = 0;
    const label = new Label(() => `Stomps: ${n}`, { color: '#abcdef', font: '10px serif' }).moveTo(8, 24);
    const ctx = { fillText: vi.fn(), fillStyle: '', font: '', textBaseline: '', textAlign: '' };
    label.draw(ctx as unknown as CanvasRenderingContext2D, 0);
    n = 3;
    label.draw(ctx as unknown as CanvasRenderingContext2D, 0);
    expect(ctx.fillText).toHaveBeenNthCalledWith(1, 'Stomps: 0', 8, 24);
    expect(ctx.fillText).toHaveBeenNthCalledWith(2, 'Stomps: 3', 8, 24);
    expect(ctx.fillStyle).toBe('#abcdef');
    expect(ctx.font).toBe('10px serif');
  });
});
