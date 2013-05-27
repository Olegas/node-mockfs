var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   fdManager = require((process.env.COVER == 'mockfs' ? '../lib-cov/' : '../lib/') + 'fd-manager.js'),
   mounted;

describe("MockFS", function(){

   it("when fs is unmounted with opened files - they are closed automatically", function(){

      var _fs = new mfs({
         items: {
            file: '123'
         }
      });

      _fs.mount('/mnt/mock');

      assert.equal(true, fdManager.isSane());

      fs.openSync('/mnt/mock/file', 'r');

      assert.equal(false, fdManager.isSane());

      _fs.umount();

      assert.equal(true, fdManager.isSane());

   });

});

