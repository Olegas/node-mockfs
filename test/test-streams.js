var mfs = require('../'),
   assert = require('assert'),
   fs = require('fs'),
   now = new Date(),
   mtime = new Date(now + 10000),
   mounted;

describe("streams", function(){

   before(function(){
      mounted = mfs.mount({
         items: {
            "readstream": new Buffer("data to read")
         }
      }, '/mnt/mock');
   });

   describe('createWriteStream', function(){

      it("creating a write stream causing new file created", function(){

         var stream = fs.createWriteStream('/mnt/mock/writestream');
         assert.equal(true, fs.existsSync('/mnt/mock/writestream'));
         stream.end();

      });

      it("writing to stream - writing to file", function(){
         var stream = fs.createWriteStream('/mnt/mock/writestream');
         stream.write("123");
         stream.end("456");

         assert.equal('123456', fs.readFileSync('/mnt/mock/writestream').toString());
      });

   });

   describe("readStream", function(){

      it("can read from file with stream", function(done){

         var stream = fs.createReadStream('/mnt/mock/readstream');
         stream.on('data', function(d){
            assert.equal("data to read", d.toString());
            stream.destroy();
            done();
         });

      });

   });

   after(function(){
      mounted.umount();
   });
});

