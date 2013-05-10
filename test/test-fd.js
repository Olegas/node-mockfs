var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("fd* functions", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            'file': {
               content: new Buffer('qwerty')
            }
         }
      }, '/mnt/mock');

   });

   it("can open and close files", function(){

      var fd = fs.openSync('/mnt/mock/file', 'r');

      assert.equal('number', typeof fd);
      assert.equal(true, fd > 0);

      fs.closeSync(fd);

   });

   it("can read files by fd", function(){

      var fd = fs.openSync('/mnt/mock/file', 'r');
      var dst = new Buffer(3);
      dst.fill('-');
      var bytesRead = fs.readSync(fd, dst, 0, 3, 1);

      assert.equal(3, bytesRead);
      assert.equal("wer", dst.toString());

      // TODO check real
      dst = new Buffer(3);
      dst.fill('-');
      bytesRead = fs.readSync(fd, dst, 0, 3, null);
      assert.equal(2, bytesRead);
      assert.equal("ty-", dst.toString());

      fs.closeSync(fd);
   });

   after(function(){
      assert.equal(true, mounted._fdManager.isSane());
      mounted.umount();
   });
});

