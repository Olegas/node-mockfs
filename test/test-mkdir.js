var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("mkdir", function(){

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

      assert.equal(false, fs.existsSync('/mnt/mock/adir/some'));
      fs.mkdirSync('/mnt/mock/adir/some');
      assert.equal(true, fs.existsSync('/mnt/mock/adir/some'));

      fs.mkdir('/mnt/mock/async', function(e) {
         assert.equal(null, e);
         assert.equal(true, fs.existsSync('/mnt/mock/async'));
         done();
      });

   });

   it("throws ENOTDIR whe parent is a file", function(){
      assert.throws(function(){
         fs.mkdirSync('/mnt/mock/file/some');
      }, /ENOTDIR/);
   });

   it("throws ENOENT if parent is not exists", function(){
      assert.throws(function(){
         fs.mkdirSync('/mnt/mock/nonexist/some');
      }, /ENOENT/);
   });

   it("throws EEXIST if directory is already exists", function(){
      assert.throws(function(){
         fs.mkdirSync('/mnt/mock/adir');
      }, /EEXIST/);
   });

   after(function(){
      mounted.umount();
   });
});

