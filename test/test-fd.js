var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   mounted;

describe("fd* functions", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            'file': {
               content: new Buffer('qwerty')
            },
            'f5bytes': new Buffer("12345"),
            'f10bytes': new Buffer("1234567890"),
            'f20bytes': new Buffer("12345678901234567890")
         }
      }, '/mnt/mock');

   });

   it("open returns an int greater than 0 file descriptor", function(){

      var fd = fs.openSync('/mnt/mock/file', 'r');

      assert.equal('number', typeof fd);
      assert.equal(true, fd > 0);

      fs.closeSync(fd);

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

