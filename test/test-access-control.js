var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("access control. EACCESS is thrown", function(){

   before(function(){
      mounted = mfs.mount({
         uid: 1,
         gid: 2,
         items: {
            'd': {
               items: {
                  f: ''
               }
            },
            'dir-cant-search': {
               mode: 'r--r--r--',
               uid: 1,
               gid: 2,
               items: {
                  file: 'data'
               }
            },
            'read-only-dir': {
               items: {
                  file: 'xxx'
               },
               mode: 'r-xr-xr-x'
            },
            'write-only-file': {
               mode: '-w--w--w-',
               content: ''
            },
            'read-only-file': {
               mode: 'r--r--r--',
               content: ''
            }
         }
      }, '/mnt/mock');

   });

   it("if trying to traverse dir without search permission", function(){
      assert.throws(function(){
         fs.statSync('/mnt/mock/dir-cant-search/f');
      }, /EACCESS/);
   });

   it("if trying to open for writing without write permissions", function(){
      assert.throws(function(){
         fs.openSync('/mnt/mock/read-only-file', 'w+');
      }, /EACCESS/);

      assert.throws(function(){
         fs.openSync('/mnt/mock/read-only-file', 'w');
      }, /EACCESS/);

      assert.throws(function(){
         fs.openSync('/mnt/mock/read-only-file', 'r+');
      }, /EACCESS/);

      assert.throws(function(){
         fs.openSync('/mnt/mock/read-only-file', 'a+');
      }, /EACCESS/);

      assert.throws(function(){
         fs.openSync('/mnt/mock/read-only-file', 'a');
      }, /EACCESS/);

      assert.equal('number', typeof fs.openSync('/mnt/mock/read-only-file', 'r'));
   });

   it("if trying to open for reading without read permissions", function(){
      // read only
      assert.throws(function(){
         fs.openSync('/mnt/mock/write-only-file', 'r');
      }, /EACCESS/);

      // read-write
      assert.throws(function(){
         fs.openSync('/mnt/mock/write-only-file', 'r+');
      }, /EACCESS/);

      assert.throws(function(){
         fs.openSync('/mnt/mock/write-only-file', 'w+');
      }, /EACCESS/);

      assert.throws(function(){
         fs.openSync('/mnt/mock/write-only-file', 'a+');
      }, /EACCESS/);

      assert.equal('number', typeof fs.openSync('/mnt/mock/write-only-file', 'w'));
      assert.equal('number', typeof fs.openSync('/mnt/mock/write-only-file', 'a'));
   });

   it("if trying to create a file but parent directory permissions forbids this", function(){
      assert.throws(function(){
         fs.openSync('/mnt/mock/read-only-dir/new-file', 'w');
      }, /EACCESS/);

      assert.throws(function(){
         fs.openSync('/mnt/mock/read-only-dir/new-file', 'w+');
      }, /EACCESS/);

      assert.throws(function(){
         fs.openSync('/mnt/mock/read-only-dir/new-file', 'a');
      }, /EACCESS/);

      assert.throws(function(){
         fs.openSync('/mnt/mock/read-only-dir/new-file', 'a+');
      }, /EACCESS/);

   });

   it("if trying to remove a file, but dir permissions forbids this", function(){
      assert.throws(function(){
         fs.unlinkSync('/mnt/mock/read-only-dir/file');
      }, /EACCESS/);
   });

   it("if trying to create a dir, but parent dir permissions forbids this", function(){
      assert.throws(function(){
         fs.mkdirSync('/mnt/mock/read-only-dir/dir');
      }, /EACCESS/);
   });

   it("if using a rename, but source or target directory writing forbidden", function(){
      // ro dir to normal one
      assert.throws(function(){
         fs.renameSync('/mnt/mock/read-only-dir/file', '/mnt/mock/d/f2');
      }, /EACCESS/);

      assert.throws(function(){
         fs.renameSync('/mnt/mock/d/f', '/mnt/mock/read-only-dir/f3');
      }, /EACCESS/);
   });

   after(function(){
      mounted.umount();
   });
});

/**
 * Created with JetBrains PhpStorm.
 * User: olegelifantev
 * Date: 26.05.13
 * Time: 23:37
 * To change this template use File | Settings | File Templates.
 */
