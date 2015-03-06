(function(){
var Vector2 = require('../Physics/Vector2.js');
var LinkedList = require('../Utility/LinkedList.js');
var userInput = require('../Core/userInput.js');
var GamePausedEvent = require('../Core/Events/GamePausedEvent.js');
var PlayerInputComponent = function(game) {
  this.game = game;
  this.walkVector = new Vector2(2,0);
  this.jumpVector= new Vector2(0,3);
  this.movementQueue = new LinkedList(256);
};

PlayerInputComponent.prototype = {
  update: function(component) {
    var me = this;
    var input = this.game.input.getInput();
    switch(input){
      case userInput.up:
        component.velocity.subtract(this.jumpVector);
        this.movementQueue.add(function(){
          component.velocity.add(me.jumpVector);
        }.bind(component));
        break;
      case userInput.down:
        component.velocity.add(this.jumpVector);
        this.movementQueue.add(function(){
          component.velocity.subtract(me.jumpVector);
        }.bind(component));
        break;
      case userInput.left:
        component.velocity.subtract(this.walkVector);
        this.movementQueue.add(function(){
          component.velocity.add(me.walkVector);
        }.bind(component));
        break;
      case userInput.right:
        component.velocity.add(this.walkVector);
        this.movementQueue.add(function(){
          component.velocity.subtract(me.walkVector);
        }.bind(component));
        break;
      case userInput.stop:
        var stopFunction =this.movementQueue.remove();
        stopFunction.call();
        break;
      case userInput.pause:
        this.game.EventManager.queueEvent(new GamePausedEvent());
        break;
    }
  }
};

module.exports = PlayerInputComponent;
}());
