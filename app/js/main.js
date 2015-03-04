var PlayerInputComponent = require('./Components/InputComponent.js');
var PhysicsComponent = require('./Components/PhysicsComponent.js');
var Box = require('./Core/box.js');
var Game = require('./Core/game.js');

var init = function(){
  var g = new Game('game');
  g.initialize();
  var box  = new Box(g);
  box.initialize();
  box.addComponent(new PlayerInputComponent(g));
  box.addComponent(new PhysicsComponent(g));
  g.gameObjects.push(box);
  var render = function(){
   g.update();
   g.draw();
   window.requestAnimationFrame(render);
 };
  render();

};

window.onload = init;
