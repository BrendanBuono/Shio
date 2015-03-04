(function(){
  'use strict';
  require('../Utility/utility.js');

  function EventManager(){
      this.registeredEventHandlerss = [].repeat([],256);
      this.queuedEvents = [];
  }
  EventManager.prototype = {
     register : function(parent,handler,eventType){
          this.registeredEventHandlerss[eventType].push(handler.bind(parent));
     },
     unregister : function(handler,eventType){
       var eventHandler = this.registeredEventHandlerss[eventType];
       var index = eventHandler.indexOf(handler);
       this.registeredEventHandlerss[eventType] = eventHandler.splice(index,1);
     },
     fireEvent : function(ev){
       var eventHandler = this.registeredEventHandlerss[ev.EventType];
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
         var ev = this.queuedEvents[i];
         this.fireEvent(ev);
         this.queuedEvents = this.queuedEvents.splice(0,1);
         if(this._exceededTime(startMillis,maxMillis)){
           break;
         }
       }
     },
     _exceededTime : function(startMillis, maxMillis){
       var curMillis = new Date().getTime();
       var elapsedMillis = curMillis - startMillis;
       if(elapsedMillis > maxMillis){
         return true;
       }
       return false;
     }
  };

  module.exports = EventManager;
}());
