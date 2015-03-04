(function(){
  'use strict';
  var EventType = require('./EventType');
  function GamePausedEvent(){
    this.EventType = EventType.GAME_PAUSED;
  }

  GamePausedEvent.prototype = {

  };

  module.exports = GamePausedEvent;
}());
