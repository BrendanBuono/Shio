(function(){
var Vector2 = require('../Physics/Vector2.js');
var PhysicsComponent = function(game){
  this.game = game;
  this.gravity = new Vector2(0,0.1);

};

PhysicsComponent.prototype = {
  update : function(component){
    component.velocity.add(component.acceleration);
    if(!this.game.onGround(component)){
      component.velocity.add(this.gravity);
    }
    else if(component.velocity.y > 0){
      component.velocity.y = 0;
    }
    component.x += component.velocity.x;
    component.y += component.velocity.y;
  }
};

module.exports = PhysicsComponent;

}());
