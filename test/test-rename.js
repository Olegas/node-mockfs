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
            'moveIt': 'file-to-move',
            'xdev': '',
            'will': 'source',
            'overwrite': 'destination',
            'overdir': {
               items: {
                  sourceOver: 'source-over'
               }
            },
            'dirToOver': {
               items: {}
            },
            'dirToMove': {
               items: {
                  file1: 'file1',
                  file2: 'file2'
               }
            },
            'target': {
               items: {}
            },
            'dir2': {
               items: {}
            },
            'dir': {
               items: {}
            },
            'dir-einval': {
               items: {
                  'dir-inner': {
                     items: {}
                  }
               }
            },
            'dir-enotempty': {
               items: {}
            },
            'not-empty-dir': {
               items: {
                  onefile: ''
               }
            }
         }
      }, '/mnt/mock');

   });

   it("change file name", function(done){

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

   it("change file location", function(){
      fs.renameSync('/mnt/mock/moveIt', '/mnt/mock/target/moveIt2');
      assert.equal(true, fs.existsSync('/mnt/mock/target/moveIt2'));
      assert.equal('file-to-move', fs.readFileSync('/mnt/mock/target/moveIt2').toString());
   });

   it("overwrites existing file", function(){
      assert.equal(true, fs.existsSync('/mnt/mock/will'));
      assert.equal(true, fs.existsSync('/mnt/mock/overwrite'));
      fs.renameSync('/mnt/mock/will', '/mnt/mock/overwrite');
      assert.equal(false, fs.existsSync('/mnt/mock/will'));
      assert.equal(true, fs.existsSync('/mnt/mock/overwrite'));
      assert.equal("source", fs.readFileSync('/mnt/mock/overwrite').toString());
   });

   it("change directory name", function(){

      assert.equal(true, fs.existsSync('/mnt/mock/dir'));
      assert.equal(false, fs.existsSync('/mnt/mock/dir-renamed'));
      fs.renameSync('/mnt/mock/dir', '/mnt/mock/dir-renamed');
      assert.equal(false, fs.existsSync('/mnt/mock/dir'));
      assert.equal(true, fs.existsSync('/mnt/mock/dir-renamed'));

   });

   it("change directory location", function(){
      fs.renameSync('/mnt/mock/dirToMove', '/mnt/mock/target/dir2Move');
      assert.equal(true, fs.existsSync('/mnt/mock/target/dir2Move'));
      assert.deepEqual(['file1', 'file2'], fs.readdirSync('/mnt/mock/target/dir2Move'));
   });

   it("overwrites existing directory", function(){
      assert.equal(true, fs.existsSync('/mnt/mock/overdir'));
      assert.equal(true, fs.existsSync('/mnt/mock/dirToOver'));
      fs.renameSync('/mnt/mock/overdir', '/mnt/mock/dirToOver');
      assert.equal(false, fs.existsSync('/mnt/mock/overdir'));
      assert.equal(true, fs.existsSync('/mnt/mock/dirToOver'));
      assert.deepEqual(["sourceOver"], fs.readdirSync('/mnt/mock/dirToOver'));
   });

   it("throws EISDIR when trying to rename file to existing directory", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/file2', '/mnt/mock/dir2');
      }, /EISDIR/);
   });

   it("throws ENOTDIR when trying to rename directory to existing file", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/dir2', '/mnt/mock/file2');
      }, /ENOTDIR/);
   });

   it("throws ENOENT when trying to rename nonexisting item", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/non-exists', '/mnt/mock/file222');
      }, /ENOENT/);
   });

   it("throws EXDEV then moving a file to another file system", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/xdev', '/mnt/mock2/file2');
      }, /EXDEV/);
   });

   it("throws EINVAL if trying to rename . or ..", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/dir2/.', '/mnt/mock/some');
      }, /EINVAL/);

      assert.throws(function(){
         fs.renameSync('/mnt/mock/dir2/..', '/mnt/mock/some');
      }, /EINVAL/);
   });

   it("throws EINVAL when source is a parent of target", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/dir-einval', '/mnt/mock/dir-einval/dir-inner');
      }, /EINVAL/);
   });

   it("throws ENOTEMPTY when trying to overwrite a non-empty dir", function(){
      assert.throws(function(){
         fs.renameSync('/mnt/mock/dir-enotempty', '/mnt/mock/not-empty-dir');
      }, /ENOTEMPTY/);
   });

   after(function(){
      mounted.umount();
   });
});

