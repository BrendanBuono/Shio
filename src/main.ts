import { PhysicsComponent } from './components/PhysicsComponent';
import { PlayerInputComponent } from './components/PlayerInputComponent';
import { Box } from './core/Box';
import { Game } from './core/Game';

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Expected a <canvas id="game"> element');
}

const game = new Game(canvas);
const box = new Box('#e63946')
  .moveTo(40, 40)
  .addComponent(new PlayerInputComponent(game.input))
  .addComponent(new PhysicsComponent(game));
game.add(box);
game.start();

// Handy for poking at the running game from the browser console.
declare global {
  interface Window {
    shio?: Game;
  }
}
window.shio = game;
