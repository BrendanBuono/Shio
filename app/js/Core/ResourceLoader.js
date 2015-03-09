(function(){
  function ResourceLoader(context){
    this.context= context;
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
    drawImg : function(dataURL,width,height,left,top){
      var img = new Image();
      img.src = dataURL;
      this.context.drawImage(img,0,0);

    },
    loadLevel : function(){
      var me = this;
  /*    var rock = this._loadResource('RockTile.png',function(image){
        this.drawImg(image,200,100,0,0);

      }.bind(this));*/
      this.drawImg('RockTile.png',200,100,0,0);
    }
  };
 module.exports = ResourceLoader;
}
());
