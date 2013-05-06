var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("readdir", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            'file.txt': '',
            'dir': {
               items: {
                  'file.txt': ''
               }
            }
         }
      }, '/mnt/mock');
   });


   it("can read contents of a directory", function(done){
      assert.deepEqual(['file.txt', 'dir'], fs.readdirSync('/mnt/mock'));
      assert.deepEqual(['file.txt', 'dir'], fs.readdirSync('/mnt/mock/'));
      assert.deepEqual(['file.txt'], fs.readdirSync('/mnt/mock/dir'));
      assert.deepEqual(['file.txt'], fs.readdirSync('/mnt/mock/dir/'));

      fs.readdir('/mnt/mock', function(e, r){
         assert.deepEqual(['file.txt', 'dir'], r);
         done();
      });
   });

   it("throws ENOTDIR if not a directory contents requested", function(){
      assert.throws(function(){
         fs.readdirSync('/mnt/mock/file.txt')
      }, /ENOTDIR/);
   });

   it("throws ENOENT if requested directory is not exists", function(){
      assert.throws(function(){
         fs.readdirSync('/mnt/mock/nonexist')
      }, /ENOENT/);
   });

   after(function(){
      mounted.umount();
   });

});

