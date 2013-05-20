var ac = require((process.env.COVER ? '../lib-cov/' : '../lib/') + 'access-control.js'),
    assert = require('assert');

describe("internals", function(){
   describe("access control utilities", function(){

      describe("mode parser", function(){
         it("can parse access mode flags from string", function(){

            assert.equal(parseInt('111101011', 2), ac.parseMode('rwxr-x-wx'));
            assert.equal(0, ac.parseMode('---------'));
            assert.equal(parseInt('0777', 8), ac.parseMode('rwxrwxrwx'));
            assert.equal(parseInt('0077', 8), ac.parseMode('---rwxrwx'));
            assert.equal(parseInt('0007', 8), ac.parseMode('------rwx'));

         });

         it("can parse access mode flags octal integer passed as string", function(){

            assert.equal(parseInt('111101011', 2), ac.parseMode('0753'));
            assert.equal(0, ac.parseMode('0000'));
            assert.equal(parseInt('0777', 8), ac.parseMode('0777'));
            assert.equal(parseInt('0077', 8), ac.parseMode('0077'));
            assert.equal(parseInt('0007', 8), ac.parseMode('0007'));

         });

         it("numbers passed without modifications", function(){

            assert.equal(parseInt('111101011', 2), ac.parseMode(0753));
            assert.equal(0, ac.parseMode(0));
            assert.equal(parseInt('0777', 8), ac.parseMode(0777));
            assert.equal(parseInt('0077', 8), ac.parseMode(0077));
            assert.equal(parseInt('0007', 8), ac.parseMode(0007));

         });

         it("incorrect symbols in string form throws RangeError", function(){

            assert.throws(function(){
               ac.parseMode('rwxrwxrwm');
            }, /RangeError/);

         });

         it("incorrect symbols placing in string form throws RangeError", function(){

            assert.throws(function(){
               ac.parseMode('xwrrwxrwx');
            }, /RangeError/);

         });

         it("passing some weird string throws TypeError (non string-mode, non octal number-as-string)", function(){
            assert.throws(function(){
               ac.parseMode('rwxrwxrwx-');
            }, /TypeError/);

            assert.throws(function(){
               ac.parseMode('-rwxrwxrwx');
            }, /TypeError/);

            assert.throws(function(){
               ac.parseMode('999');
            }, /TypeError/);
         });

         it("passing non string, nor number throws TypeError", function(){
            assert.throws(function(){
               ac.parseMode(null);
            }, /TypeError/);

            assert.throws(function(){
               ac.parseMode(new Date());
            }, /TypeError/);
         });
      });

      describe("access checker", function(){

         it("read", function(){

            assert.equal(true, ac.canRead(1, 2, 'r--------', 1, 10));
            assert.equal(false, ac.canRead(1, 2, 'r--------', 10, 10));
            assert.equal(false, ac.canRead(1, 2, 'r--------', 10, 2));
            assert.equal(true, ac.canRead(1, 2, 'r--r-----', 10, 2));
            assert.equal(false, ac.canRead(1, 2, 'r--r---wx', 10, 20));
            assert.equal(true, ac.canRead(1, 2, 'r--r--rwx', 10, 20));
            assert.equal(true, ac.canRead(1, 2, 'r-----rwx', 10, 20));
            assert.equal(true, ac.canRead(1, 2, '------rwx', 10, 20));

            assert.equal(false, ac.canRead(1, 2, 'r--r-----'));
            assert.equal(false, ac.canRead(1, 2, 'r--r-----', 2));
            assert.equal(true, ac.canRead(1, 2, 'r--r-----', 0, 2));
            assert.equal(true, ac.canRead(1, 2, '---r-----', 0, 2));

         })

      })

   });
});