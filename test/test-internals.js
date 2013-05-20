var ac = require((process.env.COVER ? '../lib-cov/' : '../lib/') + 'access-control.js'),
    assert = require('assert');

describe("internals", function(){
   describe("access control utilities", function(){

      it("can parse access mode flags from string", function(){

         assert.equal(parseInt('111101011', 2), ac.parseModeFlags('rwxr-x-wx'));
         assert.equal(0, ac.parseModeFlags('---------'));
         assert.equal(parseInt('0777', 8), ac.parseModeFlags('rwxrwxrwx'));
         assert.equal(parseInt('0077', 8), ac.parseModeFlags('---rwxrwx'));
         assert.equal(parseInt('0007', 8), ac.parseModeFlags('------rwx'));

      });

      it("can parse access mode flags octal integer passed as string", function(){

         assert.equal(parseInt('111101011', 2), ac.parseModeFlags('0753'));
         assert.equal(0, ac.parseModeFlags('0000'));
         assert.equal(parseInt('0777', 8), ac.parseModeFlags('0777'));
         assert.equal(parseInt('0077', 8), ac.parseModeFlags('0077'));
         assert.equal(parseInt('0007', 8), ac.parseModeFlags('0007'));

      });

      it("numbers passed without modifications", function(){

         assert.equal(parseInt('111101011', 2), ac.parseModeFlags(0753));
         assert.equal(0, ac.parseModeFlags(0));
         assert.equal(parseInt('0777', 8), ac.parseModeFlags(0777));
         assert.equal(parseInt('0077', 8), ac.parseModeFlags(0077));
         assert.equal(parseInt('0007', 8), ac.parseModeFlags(0007));

      });

      it("incorrect symbols in string form throws RangeError", function(){

         assert.throws(function(){
            ac.parseModeFlags('rwxrwxrwm');
         }, /RangeError/);

      });

      it("incorrect symbols placing in string form throws RangeError", function(){

         assert.throws(function(){
            ac.parseModeFlags('xwrrwxrwx');
         }, /RangeError/);

      });

      it("passing some weird string throws TypeError (non string-mode, non octal number-as-string)", function(){
         assert.throws(function(){
            ac.parseModeFlags('rwxrwxrwx-');
         }, /TypeError/);

         assert.throws(function(){
            ac.parseModeFlags('-rwxrwxrwx');
         }, /TypeError/);

         assert.throws(function(){
            ac.parseModeFlags('999');
         }, /TypeError/);
      });

      it("passing non string, nor number throws TypeError", function(){
         assert.throws(function(){
            ac.parseModeFlags(null);
         }, /TypeError/);

         assert.throws(function(){
            ac.parseModeFlags(new Date());
         }, /TypeError/);
      })

   });
});