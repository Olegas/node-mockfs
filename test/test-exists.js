var mfs = require('../'),
    assert = require('assert'),
    fs = require('fs'),
    mounted;

describe("exists", function(){

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


   describe("can check if file exists", function(){

      it("via sync api", function(){
         assert.equal(true, fs.existsSync('/mnt/mock/file.txt'));
         assert.equal(true, fs.existsSync('/mnt/mock/dir/file.txt'));
         assert.equal(false, fs.existsSync('/mnt/mock/no-file.txt'));
      });

      it("via async api", function(done){
         fs.exists('/mnt/mock/file.txt', function(r){
            assert.equal(true, r);
         });
         fs.exists('/mnt/mock/dir/file.txt', function(r){
            assert.equal(true, r);
         });
         fs.exists('/mnt/mock/no-file.txt', function(r){
            assert.equal(false, r);
            done();
         });
      });

   });

   it("can check if directory exists", function(){
      assert.equal(true, fs.existsSync('/mnt/mock'));
      assert.equal(true, fs.existsSync('/mnt/mock/'));
      assert.equal(true, fs.existsSync('/mnt/mock/dir'));
      assert.equal(true, fs.existsSync('/mnt/mock/dir/'));
      assert.equal(true, fs.existsSync('/mnt/mock/../../mnt/mock/dir/'));
      assert.equal(false, fs.existsSync('/mnt/mock/dir/no-dir'));
      assert.equal(false, fs.existsSync('/mnt/mock/dir/no-dir/'));
   });

   after(function(){
      mounted.umount();
   });

});

