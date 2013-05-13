var mfs = require('../'),
    assert = require('assert'),
    fs = require('fs'),
    mounted;

describe("readFile", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            'file-buffer': new Buffer('qwerty'),
            'file-string': 'qwerty',
            'file-base64': new Buffer('cXdlcnR5', 'base64'),
            'file-alt': {
               content: 'asobject'
            },
            'dir': {
               items: {}
            }
         }
      }, '/mnt/mock');

   });

   it("can read file synchronously", function(){

      assert.equal("qwerty", fs.readFileSync('/mnt/mock/file-buffer').toString());
      assert.equal("qwerty", fs.readFileSync('/mnt/mock/file-string').toString());
      assert.equal("asobject", fs.readFileSync('/mnt/mock/file-alt').toString());
      assert.equal("qwerty", fs.readFileSync('/mnt/mock/file-base64').toString());
      assert.equal("cXdlcnR5", fs.readFileSync('/mnt/mock/file-base64').toString('base64'));

   });

   it("can read file asynchronously", function(done){

      fs.readFile('/mnt/mock/file-string', function(e, res){
         assert.equal(null, e);
         assert.equal("qwerty", res.toString());
         done();
      });

   });

   it("calling without callback doesn't throw", function(){
      assert.doesNotThrow(function(){
         fs.readFile('/mnt/mock/file-buffer');
      }, Error);
   });

   it("throws EISDIR whe trying to read directory", function(done){
      assert.throws(function(){
         fs.readFileSync('/mnt/mock/dir');
      }, /EISDIR/);

      fs.readFile('/mnt/mock/dir', function(e, r){
         assert.equal('EISDIR', e.message);
         assert.equal(undefined, r);
         done();
      });
   });

   it("throws ENOENT if trying to read nonexistent file", function(done){
      assert.throws(function(){
         fs.readFileSync('/mnt/mock/nonexist-file');
      }, /ENOENT/);

      fs.readFile('/mnt/mock/nonexist-file', function(e, r){
         assert.equal('ENOENT', e.message);
         assert.equal(undefined, r);
         done();
      });
   });

   after(function(){
      mounted.umount();
   });
});

