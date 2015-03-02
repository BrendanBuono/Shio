(function(){
var Vector2 = require('../Physics/Vector2.js');
var LinkedList = require('../Utility/LinkedList.js');
var userInput = require('../input.js');
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
    }
  }
};


module.exports = PlayerInputComponent;
/*
var AutoInputComponent = function(game) {
  this.game = game;
  this.direction = 1;
};

AutoInputComponent.prototype = {
  getDirection: function() {
    var staySame = Math.floor(Math.random() * 100) + 1;
    if (staySame < 95) {
      return this.direction;
    }
    this.direction = Math.floor(Math.random() * 4) + 1;
    return this.direction;
  },
  update: function(component) {
    switch (this.getDirection()) {
      case 1:
        component.moveUp();
        break;
      case 2:
        component.moveDown();
        break;
      case 3:
        component.moveLeft();
        break;
      case 4:
        component.moveRight();
        break;
      default:
        break;
    }
  }
};
*/

}());
