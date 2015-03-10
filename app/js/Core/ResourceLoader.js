(function(){
  var Sprite = require('../Graphics/Sprite.js');
  function ResourceLoader(){
    this.gameData = {};
    this.sprites = [];

  }
  ResourceLoader.prototype = {
    _loadResource : function(resource, callback){
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function(){
        if( httpRequest.readyState === 4){
          if (httpRequest.status === 200){
            return callback(httpRequest.responseText);
          }
        }
      };
      httpRequest.open('GET','/'+resource,true);
      httpRequest.send(null);
    },
    _loadSprites : function(){
      var sprs = this.gameData.sprites;
      for(var i = 0; i < sprs.length;i++){
        var name = sprs[i].name;
        var source = sprs[i].source;
        var sprite = new Sprite(name,source);
        this.sprites.push(sprite);
      }
    },
    loadGame : function(){
     this._loadResource('game/game.json',function(r){
       this.gameData = JSON.parse(r);
       this._loadSprites();
       var a  = 1+1;
     }.bind(this));

    }
  };
 module.exports = ResourceLoader;
}
());
