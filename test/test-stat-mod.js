var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   now = new Date(),
   mounted;

describe("file timestamps modification", function(){

   before(function(){
      mounted = mfs.mount({
         time: now,
         items: {
            file: 'qwerty',
            dir: {
               items: {}
            }
         }
      }, '/mnt/mock');

   });

   it("reading a file updates it's atime", function(){
      throw new Error('WRITETHISTEST');
   });

   it("reading a file updates parent directory atime", function(){
      throw new Error('WRITETHISTEST');
   });

   it("writing to file updates parent directory atime", function(){
      throw new Error('WRITETHISTEST');
   });

   it("writing to file updates it's mtime and ctime", function(){
      throw new Error('WRITETHISTEST');
   });

   it("creating a new file inside a directory updates it's mtime and ctime", function(){
      throw new Error('WRITETHISTEST');
   });

   it("renaming a file modifies file ctime", function(){
      throw new Error("WRITETHISTEST");
   });

   after(function(){
      mounted.umount();
   });
});

