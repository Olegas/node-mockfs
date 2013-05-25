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
            'dir-cant-search': {
               mode: 'r--r--r--',
               uid: 1,
               gid: 2,
               items: {
                  file: 'data'
               }
            },
            'own-dir': {
               mode: 'rwxr-xr-x',
               uid: 1,
               gid: 20,
               items: {}
            },
            'grp-dir': {
               mode: 'rwxr-xr-x',
               uid: 10,
               gid: 2,
               items: {}
            },
            'others-dir': {
               mode: 'rwxr-xr-x',
               uid: 10,
               gid: 20,
               items: {}
            }
         }
      }, '/mnt/mock');

   });

   it("if trying to traverse dir without search permission", function(){
      assert.throws(function(){
         fs.statSync('/mnt/mock/dir-cant-search/f');
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
