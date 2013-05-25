var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   now = new Date(),
   mounted;

describe("file timestamps modification", function(){

   beforeEach(function(){
      mounted = mfs.mount({
         time: now,
         items: {
            file: 'qwerty',
            dir: {
               items: {
                  file: 'qwerty'
               }
            }
         }
      }, '/mnt/mock');

   });

   it("reading a file updates it's atime", function(){
      assert.equal(now, fs.statSync('/mnt/mock/file').atime);
      fs.readFileSync('/mnt/mock/file');
      assert.equal(true, now < fs.statSync('/mnt/mock/file').atime);
   });

   it("reading a file updates parent directory atime", function(){
      assert.equal(now, fs.statSync('/mnt/mock/dir/file').atime);
      fs.readFileSync('/mnt/mock/dir/file');
      assert.equal(true, now < fs.statSync('/mnt/mock/dir/file').atime);
   });

   it("writing to file updates parent directory atime", function(){
      assert.equal(now, fs.statSync('/mnt/mock/dir/file').atime);
      fs.writeFileSync('/mnt/mock/dir/file', '123');
      assert.equal(true, now < fs.statSync('/mnt/mock/dir').atime);
   });

   it("writing to file updates it's mtime and ctime", function(){
      assert.equal(now, fs.statSync('/mnt/mock/file').atime);
      assert.equal(now, fs.statSync('/mnt/mock/file').mtime);
      assert.equal(now, fs.statSync('/mnt/mock/file').ctime);
      fs.writeFileSync('/mnt/mock/file', '123');
      assert.equal(now, fs.statSync('/mnt/mock/file').atime);
      assert.equal(true, now < fs.statSync('/mnt/mock/file').mtime);
      assert.equal(true, now < fs.statSync('/mnt/mock/file').ctime);
   });

   it("creating a new file inside a directory updates it's mtime and ctime", function(){
      assert.equal(now, fs.statSync('/mnt/mock/dir').atime);
      assert.equal(now, fs.statSync('/mnt/mock/dir').mtime);
      assert.equal(now, fs.statSync('/mnt/mock/dir').ctime);
      fs.writeFileSync('/mnt/mock/dir/file2', '123');
      assert.equal(now, fs.statSync('/mnt/mock/dir').atime);
      assert.equal(true, now < fs.statSync('/mnt/mock/dir').mtime);
      assert.equal(true, now < fs.statSync('/mnt/mock/dir').ctime);
   });

   it("removing a file inside a directory updates it's mtime and ctime", function(){
      assert.equal(now, fs.statSync('/mnt/mock/dir').atime);
      assert.equal(now, fs.statSync('/mnt/mock/dir').mtime);
      assert.equal(now, fs.statSync('/mnt/mock/dir').ctime);
      fs.unlinkSync('/mnt/mock/dir/file');
      assert.equal(now, fs.statSync('/mnt/mock/dir').atime);
      assert.equal(true, now < fs.statSync('/mnt/mock/dir').mtime);
      assert.equal(true, now < fs.statSync('/mnt/mock/dir').ctime);
   });

   it("renaming a file modifies file ctime", function(){
      assert.equal(now, fs.statSync('/mnt/mock/file').ctime);
      fs.renameSync('/mnt/mock/file', '/mnt/mock/file2');
      assert.equal(true, now < fs.statSync('/mnt/mock/file2').ctime);
   });

   afterEach(function(){
      mounted.umount();
   });
});

