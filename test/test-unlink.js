var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("unlink", function(){

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

   it("removes a file", function(done){

      assert.equal(true, fs.existsSync('/mnt/mock/file'));
      fs.unlinkSync('/mnt/mock/file');
      assert.equal(false, fs.existsSync('/mnt/mock/file'));

      fs.unlink('/mnt/mock/file2', function(e) {
         assert.equal(null, e);
         assert.equal(false, fs.existsSync('/mnt/mock/file2'));
         done();
      })

   });

   it("throws EPERM when trying to unlink directory", function(){
      assert.throws(function(){
         fs.unlinkSync('/mnt/mock/dir2');
      }, /EPERM/);
   });

   it("throws ENOENT when trying to unlink nonexisting file", function(){
      assert.throws(function(){
         fs.unlinkSync('/mnt/mock/non-exists', '/mnt/mock/file222');
      }, /ENOENT/);
   });

   after(function(){
      mounted.umount();
   });
});

