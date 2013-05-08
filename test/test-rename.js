var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("rename", function(){

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

   it("rename a file", function(){

      assert.equal(true, fs.existsSync('/mnt/mock/file'));
      assert.equal(false, fs.existsSync('/mnt/mock/file-renamed'));
      fs.renameSync('/mnt/mock/file', '/mnt/mock/file-renamed');
      assert.equal(false, fs.existsSync('/mnt/mock/file'));
      assert.equal(true, fs.existsSync('/mnt/mock/file-renamed'));

   });

   it("rename a dir", function(){

      assert.equal(true, fs.existsSync('/mnt/mock/dir'));
      assert.equal(false, fs.existsSync('/mnt/mock/dir-renamed'));
      fs.renameSync('/mnt/mock/dir', '/mnt/mock/dir-renamed');
      assert.equal(false, fs.existsSync('/mnt/mock/dir'));
      assert.equal(true, fs.existsSync('/mnt/mock/dir-renamed'));

   });

   after(function(){
      mounted.umount();
   });
});

