var PlayerInputComponent = require('./Components/InputComponent.js');
//var AutoInputCrequire('Components/AutoInputComponent.js');
var PhysicsComponent = require('./Components/PhysicsComponent.js');
var Box = require('./box.js');
var Game = require('./game.js');

var init = function(){
  var g = new Game('game'); 
  g.initialize();
  var box  = new Box(g);
  box.initialize();
  box.addComponent(new PlayerInputComponent(g));
  box.addComponent(new PhysicsComponent(g));
  g.gameObjects.push(box);
  // for(var i =0; i < 10000; i++){
  //   g.gameObjects.push(randomBox(g));
  // }
  var render = function(){
   g.update();
   g.draw();
   window.requestAnimationFrame(render);
 };
  render();

};

/*var randomBox = function(game){
  var result = new Box(game);
  result.initialize();
  result.addComponent(new AutoInputComponent(game));
  return result;
};*/
window.onload = init;
