var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   ts = +new Date(),
   mounted;

describe("utimes", function(){

   before(function(){
      mounted = mfs.mount({
         time: ts,
         items: {
            'file1': "",
            'file2': {
               content: "",
               atime: ts,
               mtime: ts
            }
         }
      }, '/mnt/mock');

   });

   it("path variant", function(done){

      var statBefore = fs.statSync('/mnt/mock/file1');
      assert.equal(ts, +statBefore.mtime);
      assert.equal(ts, +statBefore.atime);

      var atime = ts + 1000, mtime = ts + 10000;
      fs.utimes('/mnt/mock/file1', atime, mtime, function(e){
         assert.equal(null, e);
         var statAfter = fs.statSync('/mnt/mock/file1');
         assert.equal(mtime, +statAfter.mtime);
         assert.equal(atime, +statAfter.atime);
         done();
      });

   });

   it("fd variant", function(done){

      var statBefore = fs.statSync('/mnt/mock/file2');
      assert.equal(ts, +statBefore.mtime);
      assert.equal(ts, +statBefore.atime);

      var fd = fs.openSync('/mnt/mock/file2', 'w');
      var atime = ts + 1000, mtime = ts + 10000;
      fs.futimes(fd, atime, mtime, function(e){
         assert.equal(null, e);
         var statAfter = fs.statSync('/mnt/mock/file2');
         assert.equal(mtime, +statAfter.mtime);
         assert.equal(atime, +statAfter.atime);
         fs.closeSync(fd);
         done();
      });

   });

   after(function(){
      mounted.umount();
   });
});

