(function(){
var KeyboardInput = require('./keyboard.js');
var GuidGenerator = require('../Utility/UUIDjs.js');
var debug = true;
function Game(canvas) {
  this.canvas = document.getElementById(canvas);
  this.ctx = this.canvas.getContext('2d');
  this.offScreenCanvas = document.createElement('canvas');
  this.offScreenCanvas.width = this.width;
  this.offScreenCanvas.height = this.height;
  this.offScreenContext = this.offScreenCanvas.getContext('2d');
  this.lastTick = new Date();
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.input = null;
  this.fps = 0;
  this.updateFps = false;
  this.gameObjects = [];
  this.paused = false;
}
Game.prototype = {

  initialize: function() {
    this.ctx.fillStyle = '#FF0000';
    this.input = new KeyboardInput();
    var me = this;
    me.resizeToFullScreen();
    window.onkeydown = function(e) {
      me.input.start(e);
    };
    window.onkeyup = function(e) {
      me.input.end(e);
    };
    window.onresize = me.resizeToFullScreen.bind(me);
    setInterval(function() {
      me.updateFps = true;
    }, 1000);
  },
  getGuid : function(){
    return GuidGenerator.create();
  },
  calculateFramesPerSecond: function() {
    var thisTick = new Date();
    if (this.updateFps) {
      this.fps = 1000 / (thisTick - this.lastTick);
      this.updateFps = false;
    }
    this.lastTick = thisTick;
  },
  drawFramesPerSecond: function() {
    this.ctx.fillText(Math.floor(this.fps), 10, 10);
  },
  update: function() {
    if (!this.paused) {
      this.calculateFramesPerSecond();
      for (var i = 0; i < this.gameObjects.length; i++) {
        this.gameObjects[i].update();
      }
    }
  },
  getInput : function(){
    return this.input.getInput();
  },
  onGround : function(object){
    return object.y + 40 >= this.height;
  },
  resizeToFullScreen: function() {
    this.canvas.width = this.width = window.innerWidth;
    this.canvas.height = this.height = window.innerHeight - 4;

  },
  draw: function() {
    this.ctx.clearRect(0, 0, this.width, this.height);

  for (var i = 0; i < this.gameObjects.length; i++) {
      this.gameObjects[i].draw(this.ctx);
    }
  }
};

module.exports = Game;

}());
