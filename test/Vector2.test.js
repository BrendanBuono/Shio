(function(){
  'use strict';
  var Vector2 = require('../app/js/Physics/Vector2.js');
  describe("Vector2", function(){
    var v1 = new Vector2(1,1);
    var v2 = new Vector2(1,1);
    beforeEach(function(){
      v1 = new Vector2(1,1);
      v2 = new Vector2(1,1);
    })
    it("adds two Vectors correctly",function(){
      v1.add(v2);
      expect(v1.x).toBe(2);
      expect(v1.y).toBe(2);
    });
    it("subtracts two Vectors correctly",function(){
      v1.subtract(v2);
      expect(v1.x).toBe(0);
      expect(v1.y).toBe(0);
    });
  });
}());
