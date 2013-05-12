var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("fd* functions", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            dir: {
               items: {}
            },
            'emptyfile': '',
            'file': {
               content: new Buffer('qwerty')
            },
            'f5bytes': new Buffer("12345"),
            'f10bytes': new Buffer("1234567890"),
            'f20bytes': new Buffer("12345678901234567890")
         }
      }, '/mnt/mock');

   });

   describe("open", function(){

      it("directory can't be opened for writing, EISDIR is thrown", function(){
         assert.throws(function(){
            fs.openSync('/mnt/mock/dir', 'w');
         }, /EISDIR/);
      });

      it("returns an int greater than 0 file descriptor", function(){

         var fd = fs.openSync('/mnt/mock/file', 'r');

         assert.equal('number', typeof fd);
         assert.equal(true, fd > 0);

         fs.closeSync(fd);

      });

      it("throws EINVAL in case of unknown string flags", function(){
         assert.throws(function(){
            fs.openSync('/mnt/mock/some/file', 'xxxx');
         }, /EINVAL/);
      });

      it("read flags (r, r+, rs, rs+) didn't create any files, ENOENT is thrown", function() {
         assert.throws(function(){
            fs.openSync('/mnt/mock/new-file', 'r');
         }, /ENOENT/);

         assert.throws(function(){
            fs.openSync('/mnt/mock/new-file', 'r+');
         }, /ENOENT/);

         assert.throws(function(){
            fs.openSync('/mnt/mock/new-file', 'rs');
         }, /ENOENT/);

         assert.throws(function(){
            fs.openSync('/mnt/mock/new-file', 'rs+');
         }, /ENOENT/);
      });

      it("if parent is not a directory, ENOTDIR is thrown", function(){

         assert.throws(function(){
            fs.openSync('/mnt/mock/file/new-file', 'w');
         }, /ENOTDIR/);

         assert.throws(function(){
            fs.openSync('/mnt/mock/file/new-file', 'r');
         }, /ENOTDIR/);

      });

      describe("exclusive mode", function(){

         it("if file is already exists, EEXIST is thrown", function(){

            assert.throws(function(){
               fs.openSync('/mnt/mock/file', 'wx');
            }, /EEXIST/);

            assert.throws(function(){
               fs.openSync('/mnt/mock/file', 'ax');
            }, /EEXIST/);

            assert.throws(function(){
               fs.openSync('/mnt/mock/file', 'wx+');
            }, /EEXIST/);

            assert.throws(function(){
               fs.openSync('/mnt/mock/file', 'ax+');
            }, /EEXIST/);

         });

      });

   });

   describe("write(Sync)", function(){

      it("if file is opened for reading only, EACCESS is thrown", function(){

         var fd = fs.openSync('/mnt/mock/file', 'r');
         assert.throws(function(){
            fs.writeSync(fd, new Buffer("123"), 0, 3, null);
         }, /EACCESS/);
         fs.closeSync(fd);

      });

      it("can write data", function(done){
         fs.open('/mnt/mock/emptyfile', 'w+', function(e, fd){
            assert.equal(null, e);
            var buf = new Buffer("qwertyasdf");
            fs.write(fd, buf, 0, 10, null, function(e, bytesWritten){
               assert.equal(null, e);
               assert.equal(10, bytesWritten);
               fs.write(fd, buf, 0, 10, 8, function(e, bytesWritten){
                  assert.equal(null, e);
                  assert.equal(10, bytesWritten);
                  fs.write(fd, buf, 0, 10, null, function(e, bytesWritten){
                     assert.equal(null, e);
                     assert.equal(10, bytesWritten);
                     var written = new Buffer(100);
                     fs.read(fd, written, 0, 100, 0, function(e, bytesRead){
                        assert.equal(null, e);
                        assert.equal(28, bytesRead);
                        assert.equal("qwertyasqwertyasdfqwertyasdf", written.toString('utf8', 0, 28));
                        fs.close(fd, function(e){
                           assert.equal(null, e);
                           done();
                        });
                     });
                  });
               })
            })
         })
      })

   });

   describe("read(Sync)", function(){

      it("can read files by fd", function(){

         var fd = fs.openSync('/mnt/mock/file', 'r');
         var dst = new Buffer(3);
         dst.fill('-');
         var bytesRead = fs.readSync(fd, dst, 0, 3, 1);

         assert.equal(3, bytesRead);
         assert.equal("wer", dst.toString());

         // TODO check real
         dst = new Buffer(3);
         dst.fill('-');
         bytesRead = fs.readSync(fd, dst, 0, 3, null);
         assert.equal(2, bytesRead);
         assert.equal("ty-", dst.toString());

         fs.closeSync(fd);
      });

      it("if file is opened for writing only, EBADF is thrown", function(){
         var fd = fs.openSync('/mnt/mock/file', 'w');
         assert.throws(function(){
            fs.readSync(fd, new Buffer(1), 0, 1, null);
         }, /EBADF/);
         fs.closeSync(fd);
      })

   });

   describe("ftruncate", function(){

      it("Truncates a file content to specified number of bytes", function(done){
         assert.equal(20, fs.statSync('/mnt/mock/f20bytes').size);
         fs.open('/mnt/mock/f20bytes', 'r+', function(e, fd){
            fs.truncate(fd, 15, function(e){
               assert.equal(null, e);
               fs.fstat(fd, function(e, stat){
                  assert.equal(15, stat.size);
                  fs.closeSync(fd);
                  done();
               });
            });
         })
      });

      it("Truncates a file content to zero bytes if no length specified", function(done){
         assert.equal(10, fs.statSync('/mnt/mock/f10bytes').size);
         fs.open('/mnt/mock/f10bytes', 'r+', function(e, fd){
            fs.truncate(fd, function(e){
               assert.equal(null, e);
               assert.equal(0, fs.statSync('/mnt/mock/f10bytes').size);
               fs.closeSync(fd);
               done();
            });
         })
      });

      it("If truncate length is greated than file size, if is extended and filled with zeroes", function(done){
         assert.equal(5, fs.statSync('/mnt/mock/f5bytes').size);
         fs.open('/mnt/mock/f5bytes', 'r+', function(e, fd){
            fs.truncate(fd, 15, function(e){
               assert.equal(null, e);
               assert.equal(15, fs.statSync('/mnt/mock/f5bytes').size);
               var res = new Buffer(15);
               fs.read(fd, res, 0, 15, null, function(e, bytesRead){
                  assert.equal(null, e);
                  assert.equal(15, bytesRead);
                  assert.equal("12345\0\0\0\0\0\0\0\0\0\0", res.toString());
                  fs.closeSync(fd);
                  done();
               });
            });
         })
      });

      it("throws EINVAL when supplied file descriptor is not opened for writing", function(){
         var fd = fs.openSync('/mnt/mock/file', 'r');
         assert.throws(function(){
            fs.truncateSync(fd);
         }, /EINVAL/);
         fs.closeSync(fd);
      });

   });

   it("if given a bad file descriptor, EBADF is thrown", function(){
      assert.throws(function(){
         fs.closeSync(-100);
      }, /EBADF/);
   });

   after(function(){
      assert.equal(true, mounted._fdManager.isSane());
      mounted.umount();
   });
});

