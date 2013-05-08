var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("rename", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            'file': '',
            'file2': '',
            'dir2': {
               items: {}
            },
            'dir': {
               items: {}
            }
         }
      }, '/mnt/mock');

   });

   it("rename a file", function(done){

      assert.equal(true, fs.existsSync('/mnt/mock/file'));
      assert.equal(false, fs.existsSync('/mnt/mock/file-renamed'));
      fs.renameSync('/mnt/mock/file', '/mnt/mock/file-renamed');
      assert.equal(false, fs.existsSync('/mnt/mock/file'));
      assert.equal(true, fs.existsSync('/mnt/mock/file-renamed'));

      fs.rename('/mnt/mock/file-renamed', '/mnt/mock/file-renamed-2', function(e) {
         assert.equal(null, e);
         assert.equal(false, fs.existsSync('/mnt/mock/file-renamed'));
         assert.equal(true, fs.existsSync('/mnt/mock/file-renamed-2'));
         done();
      })

   });

   it("rename a dir", function(){

      assert.equal(true, fs.existsSync('/mnt/mock/dir'));
      assert.equal(false, fs.existsSync('/mnt/mock/dir-renamed'));
      fs.renameSync('/mnt/mock/dir', '/mnt/mock/dir-renamed');
      assert.equal(false, fs.existsSync('/mnt/mock/dir'));
      assert.equal(true, fs.existsSync('/mnt/mock/dir-renamed'));

   });

   it("throws EISDIR when trying to rename file to existing directory", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/file2', '/mnt/mock/dir2');
      }, /EISDIR/);
   });

   it("throws ENOTDIR when trying to rename file to existing directory", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/dir2', '/mnt/mock/file2');
      }, /ENOTDIR/);
   });

   it("throws ENOENT when trying to rename nonexisting file", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/non-exists', '/mnt/mock/file222');
      }, /ENOENT/);
   });

   after(function(){
      mounted.umount();
   });
});

