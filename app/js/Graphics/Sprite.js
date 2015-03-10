(function(){
  'use strict';
  function Sprite(name, spriteSheetSource){
    this.spriteSheet = new Image();
    this.spriteSheet.src = spriteSheetSource;
    this.name = name;
  }
  Sprite.prototype = {
    draw : function(ctx){
      ctx.drawImage(this.spriteSheet,0,0);
    }
  };

  module.exports = Sprite;
}());
