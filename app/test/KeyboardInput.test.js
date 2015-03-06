(function(){
  'use strict';
  var KeyboardInput = require('../js/Core/KeyboardInput.js');
  var userInput = require('../js/Core/UserInput.js');
  describe("keyboardInput", function(){
    var keyboardInput = new KeyboardInput();
    var e = {};
    beforeEach(function(){
      keyboardInput = new KeyboardInput();
      e = {};
    });
    it("translate down arrow input to down user input",function(){
      e.keyCode = 40;
      keyboardInput.start(e);
      var lastInput = keyboardInput.getInput();
      expect(lastInput).toBe(userInput.down);
    });
    it("captures down input only once",function(){
      e.keyCode = 40;
      keyboardInput.start(e);
      keyboardInput.start(e);
      keyboardInput.getInput();
      var lastInput = keyboardInput.getInput();
      expect(lastInput).toBe(-1);
    });
    it("translate stop on end of down input",function(){
       e.keyCode = 40;
       keyboardInput.end(e);
       var lastInput = keyboardInput.getInput();
       expect(lastInput).toBe(userInput.stop);
    });
    it("translate left arrow input to down user input",function(){
      e.keyCode = 37;
      keyboardInput.start(e);
      var lastInput = keyboardInput.getInput();
      expect(lastInput).toBe(userInput.left);
    });
    it("captures left input only once",function(){
      e.keyCode = 37;
      keyboardInput.start(e);
      keyboardInput.start(e);
      keyboardInput.getInput();
      var lastInput = keyboardInput.getInput();
      expect(lastInput).toBe(-1);
    });
    it("translate right arrow input to down user input",function(){
      e.keyCode = 39;
      keyboardInput.start(e);
      var lastInput = keyboardInput.getInput();
      expect(lastInput).toBe(userInput.right);
    });
    it("captures right input only once",function(){
      e.keyCode = 39;
      keyboardInput.start(e);
      keyboardInput.start(e);
      keyboardInput.getInput();
      var lastInput = keyboardInput.getInput();
      expect(lastInput).toBe(-1);
    });
    it("translate up arrow input to down user input",function(){
      e.keyCode = 38;
      keyboardInput.start(e);
      var lastInput = keyboardInput.getInput();
      expect(lastInput).toBe(userInput.up);
    });
    it("captures up input only once",function(){
      e.keyCode = 38;
      keyboardInput.start(e);
      keyboardInput.start(e);
      keyboardInput.getInput();
      var lastInput = keyboardInput.getInput();
      expect(lastInput).toBe(-1);
    });
  });
}());
