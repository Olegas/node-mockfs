var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("writeFile", function(){

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

   it("can create new files", function(){

      assert.equal(false, fs.existsSync('/mnt/mock/dir/file2'));
      fs.writeFileSync('/mnt/mock/dir/file2', "file2");
      assert.equal(true, fs.existsSync('/mnt/mock/dir/file2'));
      assert.equal("file2", fs.readFileSync('/mnt/mock/dir/file2').toString());

   });

   it("can overwrite existing files", function(){

      assert.equal("qwerty", fs.readFileSync('/mnt/mock/file1').toString());
      fs.writeFileSync('/mnt/mock/file1', "file1");
      assert.equal("file1", fs.readFileSync('/mnt/mock/file1').toString());

   });

   it("calling without arguments throws a TypeError", function(){
      assert.throws(function(){
         fs.writeFileSync();
      }, TypeError);
   });

   it("throws ENOENT if trying to write to file in a nonexistent directory", function(){
      assert.throws(function(){
         fs.writeFileSync('/mnt/mock/nonexist/file', 'willthrow');
      }, /ENOENT/);
   });

   after(function(){
      mounted.umount();
   });
});

