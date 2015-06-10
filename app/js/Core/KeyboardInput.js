
(function(){

  var LinkedList = require('../Utility/LinkedList.js');
  require('../Namespaces/Utility.js');
  var userInput = require('./UserInput.js');
  var keyboardCodes = {
    backspace: 8,
    tab: 9,
    enter: 13,
    shift: 16,
    ctrl: 17,
    alt: 18,
    pause: 19,
    capsLock: 20,
    escape: 27,
    pageUp: 33,
    pageDown: 34,
    end: 35,
    home: 36,
    leftArrow: 37,
    upArrow: 38,
    rightArrow: 39,
    downArrow: 40,
    insert: 45,
    del: 46,
    zero: 48,
    one: 49,
    two: 50,
    three: 51,
    four: 52,
    five: 53,
    six: 54,
    seven: 55,
    eight: 56,
    nine: 57,
    a: 65,
    b: 66,
    c: 67,
    d: 68,
    e: 69,
    f: 70,
    g: 71,
    h: 72,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    n: 78,
    o: 79,
    p: 80,
    q: 81,
    r: 82,
    s: 83,
    t: 84,
    u: 85,
    v: 86,
    w: 87,
    x: 88,
    y: 89,
    z: 90,
    leftWindowKey: 91,
    rightWindowKey: 92,
    selectKey: 93,
    numpadZero: 96,
    numpadOne: 97,
    numpadTwo: 98,
    numpadThree: 99,
    numpadFour: 100,
    numpadFive: 101,
    numpadSix: 102,
    numpadSeven: 103,
    numpadEight: 104,
    numpadNine: 105,
    multiply: 106,
    add: 107,
    subtract: 109,
    decimalPoint: 110,
    divide: 111,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    numLock: 144,
    scrollLock: 145,
    semicolon: 186,
    equalSign: 187,
    comma: 188,
    dash: 189,
    period: 190,
    forwardSlash: 191,
    graveAccent: 192,
    openBracket: 219,
    backslash: 220,
    closeBraket: 221,
    singlequote: 222

  };

  function KeyboardInput() {
    this.queue = new LinkedList(256);
    this.keyFired = [].repeat(false, 256);
  }
  KeyboardInput.prototype = {
    // registerFunction : function(code, parent, callback){
    // if(this.functions[code] == null){
    //   this.functions[code] = [];
    // }
    // this.functions[code].push({owner : parent, event : callback});
    // },
    start: function(e) {
      var code = e.keyCode;
      if (!this.keyFired[code]) {
        switch (code) {
          case keyboardCodes.leftArrow:
            this.queue.add(userInput.left);
            break;
          case keyboardCodes.rightArrow:
            this.queue.add(userInput.right);
            break;
          case keyboardCodes.upArrow:
            this.queue.add(userInput.up);
            break;
          case keyboardCodes.downArrow:
            this.queue.add(userInput.down);
            break;
          case keyboardCodes.escape:
            this.queue.add(userInput.pause);
            break;
        }
        this.keyFired[code] = true;
      }
    },
    end: function(e) {
      var code = e.keyCode;
      switch (code) {
        case keyboardCodes.leftArrow:
        case keyboardCodes.rightArrow:
        case keyboardCodes.downArrow:
          this.queue.add(userInput.stop);
          break;
      }
      this.keyFired[code] = false;
    },
    getInput: function() {
      return this.queue.remove();
    }
  };

  module.exports = KeyboardInput;

}());
