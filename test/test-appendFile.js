var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("appendFile", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            'file1': new Buffer('qwerty'),
            'dir': {
               items: {}
            }
         }
      }, '/mnt/mock');

   });

   it("can create new files", function(done){

      assert.equal(false, fs.existsSync('/mnt/mock/dir/file2'));
      fs.appendFileSync('/mnt/mock/dir/file2', "file2");
      assert.equal(true, fs.existsSync('/mnt/mock/dir/file2'));
      assert.equal("file2", fs.readFileSync('/mnt/mock/dir/file2').toString());

      fs.appendFile('/mnt/mock/dir/file3', 'file3', function(e){
         assert.equal(null, e);
         assert.equal("file3", fs.readFileSync('/mnt/mock/dir/file3').toString());
         done();
      });

   });

   it("can append to existing files", function(done){

      assert.equal("qwerty", fs.readFileSync('/mnt/mock/file1').toString());
      fs.appendFileSync('/mnt/mock/file1', "file1");
      assert.equal("qwertyfile1", fs.readFileSync('/mnt/mock/file1').toString());

      fs.appendFile('/mnt/mock/file1', 'file1-async', function(e){
         assert.equal(null, e);
         assert.equal("qwertyfile1file1-async", fs.readFileSync('/mnt/mock/file1').toString());
         done();
      });

   });

   it("throws ENOENT if trying to write to file in a nonexistent directory", function(){
      assert.throws(function(){
         fs.appendFileSync('/mnt/mock/nonexist/file', 'willthrow');
      }, /ENOENT/);
   });

   it("throws ENOTDIR if trying to write to file in a non-directory", function(){
      assert.throws(function(){
         fs.appendFileSync('/mnt/mock/file1/file', 'willthrow');
      }, /ENOTDIR/);
   });

   it("throws EISDIR if trying to write to a directory", function(){
      assert.throws(function(){
         fs.appendFileSync('/mnt/mock/dir', 'willthrow');
      }, /EISDIR/);
   });

   after(function(){
      mounted.umount();
   });
});

