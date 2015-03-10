var mfs = require('../'),
   assert = require('assert'),
   mkdirp = require('mkdirp'),
   fs = require('fs'),
   mounted;

/**
    mkdirp is a utility function for creating directory paths
    mkdirp expects to have error codes on exceptions thrown by the file system,
    like the normal node fs does. These tests are included to make sure mkdirp
    works as expected on mockfs.
*/

describe("mkdirp", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            'file': '',
            'adir': {
               items: {}
            }
         }
      }, '/mnt/mock');

   });

   it("can create directories in already existing ones", function(done){

      assert.equal(false, fs.existsSync('/mnt/mock/adir/some/other'));
      mkdirp.sync('/mnt/mock/adir/some/other');
      assert.equal(true, fs.existsSync('/mnt/mock/adir/some/other'));

      mkdirp('/mnt/mock/async/example', function(e) {
         assert.equal(null, e);
         assert.equal(true, fs.existsSync('/mnt/mock/async/example'));
         done();
      });

   });

   it("throws ENOTDIR when parent is a file", function(){
      assert.throws(function(){
         mkdirp.sync('/mnt/mock/file/some');
      }, /ENOTDIR/);
   });

   it("creates directory even if parent does not exists", function(){
      assert.equal(false, fs.existsSync('/mnt/mock/nonexist/some'));
      mkdirp.sync('/mnt/mock/nonexist/some');
      assert.equal(true, fs.existsSync('/mnt/mock/nonexist/some'));
   });

   it("Ignores if directory already exists", function(){
       assert.equal(true, fs.existsSync('/mnt/mock/adir'));
       mkdirp.sync('/mnt/mock/adir');
       assert.equal(true, fs.existsSync('/mnt/mock/adir'));
   });

   after(function(){
      mounted.umount();
   });
});
