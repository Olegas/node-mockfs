var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("rmdir", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            'file': '',
            'dir2': {
               items: {}
            },
            'dir': {
               items: {}
            },
            'dir-with-files': {
               items: {
                  file: ''
               }
            }
         }
      }, '/mnt/mock');

   });

   it("removes a directory", function(done){

      assert.equal(true, fs.existsSync('/mnt/mock/dir'));
      fs.rmdirSync('/mnt/mock/dir');
      assert.equal(false, fs.existsSync('/mnt/mock/dir'));

      fs.rmdir('/mnt/mock/dir2', function(e) {
         assert.equal(null, e);
         assert.equal(false, fs.existsSync('/mnt/mock/dir2'));
         done();
      })

   });

   it("throws ENOTDIR when trying to rmdir a file", function(done){
      assert.throws(function(){
         fs.rmdirSync('/mnt/mock/file');
      }, /ENOTDIR/);

      fs.rmdir('/mnt/mock/file', function(e){
         assert.equal(e.message, 'ENOTDIR');
         done();
      })
   });

   it("throws ENOENT when trying to rmdir nonexisting directory", function(done){
      assert.throws(function(){
         fs.rmdirSync('/mnt/mock/non-exists');
      }, /ENOENT/);

      fs.rmdir('/mnt/mock/non-exists', function(e){
         assert.equal(e.message, 'ENOENT');
         done();
      })
   });

   it("throws ENOTEMPTY if trying to remove non-empty directory", function(){
      assert.throws(function(){
         fs.rmdirSync('/mnt/mock/dir-with-files');
      }, /ENOTEMPTY/);
   });

   after(function(){
      mounted.umount();
   });
});

