(function(){

   "use strict";

   var path = require('path'),
       fdMap = {},
       O_RD = 1,
       O_WR = 2,
       O_ONLY = 4,
       O_RDWR = O_RD | O_WR,
       O_RDONLY = O_RD,
       O_TRUNC = 8,
       O_CREAT = 16,
       O_WRONLY = O_WR,
       O_EXCL = 64,
       O_APPEND = 128;

   function getFdOrThrow(fd) {
      if(fd in fdMap) {
         return fdMap[fd];
      } else {
         throw new Error('EBADF');
      }
   }

   // from original fs module
   function parseFlags(flags){

      if (typeof flags !== 'string') {
         return flags;
      }

      // MockFS ignores sync mode
      switch (flags) {
         case 'r' : // fall through
         case 'rs' : return O_RDONLY;
         case 'r+' : // fall through
         case 'rs+' : return O_RDWR;

         case 'w' : return O_TRUNC | O_CREAT | O_WRONLY;
         case 'wx' : // fall through
         case 'xw' : return O_TRUNC | O_CREAT | O_WRONLY | O_EXCL;

         case 'w+' : return O_TRUNC | O_CREAT | O_RDWR;
         case 'wx+': // fall through
         case 'xw+': return O_TRUNC | O_CREAT | O_RDWR | O_EXCL;

         case 'a' : return O_APPEND | O_CREAT | O_WRONLY;
         case 'ax' : // fall through
         case 'xa' : return O_APPEND | O_CREAT | O_WRONLY | O_EXCL;

         case 'a+' : return O_APPEND | O_CREAT | O_RDWR;
         case 'ax+': // fall through
         case 'xa+': return O_APPEND | O_CREAT | O_RDWR | O_EXCL;
      }

      throw new Error('EINVAL');
   }

   module.exports = {
      _fsyncSync: function(fd) {
         getFdOrThrow(fd);
      },
      _truncateSync: function(fd, len) {
         this._throwIfFSReadOnly();
         fd = getFdOrThrow(fd);
         len = len || 0;
         if(fd.flags & O_WR) {
            if(len > fd.item.content.length) {
               var add = new Buffer(len - fd.item.content.length);
               add.fill(0);
               fd.item.content = Buffer.concat([fd.item.content, add]);
            }
         } else {
            throw new Error('EINVAL');
         }
      },
      _openSync: function(p, flags, mode) {
         flags = parseFlags(flags);
         mode = mode || parseInt('0666', 8);

         var parent = this._lookupParent(p), name = path.basename(p), it;
         try {
            it = this._lookup(p);
         } catch(e) {}

         if(it) {
            // target path exists, is directory and write mode specified
            if((flags & O_WR) && this._isDirectory(it)) {
               throw new Error('EISDIR');
            }
            // file exists, but exclusive creation requested
            if((flags & O_CREAT) && (flags & O_EXCL)) {
               throw new Error('EEXIST');
            }
            if(flags & O_TRUNC) {
               // reset file content if requested
               it.content = new Buffer("");
            }
         } else {
            if(flags & O_CREAT) {
               it = this._mkFile(parent, name, new Buffer(""), mode);
            } else {
               // file is not exists and no creation flag
               throw new Error('ENOENT');
            }
         }

         var fd = this._getFd();
         fdMap[fd] = {
            item: it,
            flags: flags,
            position: 0
         };
         return fd;
      },
      _fstatSync: function(fd) {
         fd = getFdOrThrow(fd);
         throw new Error('ENOTIMPLEMENTED');
      },
      _writeSync: function(fd, buffer, offset, length, position) {
         var start;

         fd = getFdOrThrow(fd);
         if(!(fd.flags & O_WR)) {
            throw new Error('EACCESS');
         }
         offset = offset || 0;
         length = length || 0;

         if(length === 0)
            return 0;

         // TODO negative values?
         start = position == null ? fd.position : (position || 0);


         var bufToWrite = buffer.slice(offset, offset + length);
         fd.item.content = Buffer.concat([ fd.item.content.slice(0, start), bufToWrite ]);

         fd.position = start + length;

         return length;
      },
      _readSync: function(fd, buffer, offset, length, position) {
         var start, end;

         fd = getFdOrThrow(fd);
         if(!(fd.flags & O_RD)) {
            throw new Error('EACCESS');
         }
         offset = offset || 0;
         length = length || 0;

         if(length === 0)
            return 0;

         start = position == null ? fd.position : (position || 0);
         end = Math.min(fd.item.content.length, start + length);

         fd.item.content.copy(buffer, offset, start, end);
         fd.position = end;

         return end - start;
      },
      _closeSync: function(fd) {
         getFdOrThrow(fd);
         delete fdMap[fd];
         this._fdManager.releaseFd(fd);
      }
   };

})();