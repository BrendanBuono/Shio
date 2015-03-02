(function() {
  'use strict';
  var Vector2 = function(x, y) {
    this.x = x;
    this.y = y;
  };
  Vector2.prototype = {
    add: function(vector) {
      this.x = this.x + vector.x;
      this.y = this.y + vector.y;
    },
    subtract: function(vector) {
      this.x = this.x - vector.x;
      this.y = this.y - vector.y;
    }
  };

  module.exports = Vector2;
}());
