(function(){
  'use strict';
  require('../Utility/utility.js');
  var EventType = {
    PLAYER_DIED : 0,
    PLAYER_RESPAWN : 1,
    GAME_PAUSED : 2,
    COLLISION : 3,
    ACTOR_CREATED : 4,
    ACTOR_DESTROYED : 5
  };
  function EventManager(){
      this.registeredEventHandlers = [].repeat([],256);
      this.queuedEvents = [];
  }
  EventManager.prototype = {
     register : function(parent,handler,eventType){
          this.registeredEventHandler[eventType].push(handler.bind(parent));
     },
     unregister : function(handler,eventType){
       var eventHandler = this.registeredEventHandler[eventType];
       var index = eventHandler.indexOf(handler);
       this.registeredEventHandler[eventType] = eventHandler.splice(index,1);
     },
     fireEvent : function(ev){
       var eventHandler = this.registeredEventHandler[ev.EventType];
       for(var i =0;i<eventHandler.length;i++){
         eventHandler[i](ev);
       }
     },
     queueEvent : function(ev){
        this.queuedEvents.push(ev);
     },
     update : function(maxMillis){
       var startMillis = new Date().getTime();
       for(var i =0;i<this.queuedEvents.length;i++){
         var ev = this.queuedEvent[i];
         fireEvent(ev);
         if(_exceededTime(startMillis,maxMillis)){
           break;
         }
       }
     },
     _exceededTime : function(startMillis, maxMillis){
       var curMillis = new Date().getTime();
       var elapsedMillis = curMillis - elapsedMillis;
       if(elapsedMillis > maxMillis){
         return true;
       }
       return false;
     }
  };

  module.exports = [Event,EventManager];
}());
