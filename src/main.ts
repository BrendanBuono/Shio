import { Game } from './core/Game';
import { ResourceLoader } from './core/ResourceLoader';
import { buildLevel } from './demo/buildLevel';
import { wireSounds } from './demo/sounds';

function requireCanvas(): HTMLCanvasElement {
  const canvas = document.getElementById('game');
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error('Expected a <canvas id="game"> element');
  return canvas;
}

async function main(): Promise<void> {
  const game = new Game(requireCanvas());
  const { assets, level } = await new ResourceLoader().loadGame(`${import.meta.env.BASE_URL}game/game.json`);
  if (!level) throw new Error('game.json does not name a level');
  buildLevel(game, assets, level);
  wireSounds(game.events, game.sound);
  game.start();
  window.shio = game;
}

function showError(error: unknown): void {
  console.error(error);
  const ctx = requireCanvas().getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText(`Failed to start: ${error instanceof Error ? error.message : String(error)}`, 16, 32);
}

// Handy for poking at the running game from the browser console.
declare global {
  interface Window {
    shio?: Game;
  }
}

main().catch(showError);
