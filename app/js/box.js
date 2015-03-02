var Vector2 = require('./Physics/Vector2.js');
function Box(game) {
  this.x = 10;
  this.y = 10;
  this.velocity = new Vector2(0, 0);
  this.acceleration = new Vector2(0, 0);
  this.game = game;
  this.components = [];
}
Box.prototype = {
  initialize: function() {

  },
  addComponent: function(c) {
    this.components.push(c);
  },

  update: function() {
    for (var i = 0; i < this.components.length; i++) {
      this.components[i].update(this);
    }
  },
  draw: function(ctx) {
    ctx.fillRect(this.x, this.y, 20, 20);
  }
};

module.exports = Box;
