(function(){

   "use strict";

   var path = require('path'),
       fdMap = {},
       contants = process.binding('constants'), // magic...
       O_RDWR = contants.O_RDWR || 0,
       O_RDONLY = contants.O_RDONLY || 0,
       O_TRUNC = contants.O_TRUNC || 0,
       O_CREAT = contants.O_CREAT || 0,
       O_WRONLY = contants.O_WRONLY || 0,
       O_EXCL = contants.O_EXCL || 0,
       O_APPEND = contants.O_APPEND || 0;

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
         this._throwIfNotNumber(fd);
         getFdOrThrow(fd);
      },
      _fsync: function() {
         var cb = this._getcb(arguments);
         try {
            cb(null, this._fsyncSync.apply(this, arguments));
         } catch(e){
            cb(e);
         }
      },
      _truncateSync: function(fd, len) {
         this._throwIfNotNumber(fd);
         this._throwIfFSReadOnly();
         fd = getFdOrThrow(fd);
         len = len || 0;
         if(!(fd.flags & O_RDONLY)) {
            var currentSize = fd.item.content.length;
            if(len > currentSize) {
               var add = new Buffer(len - fd.item.content.length);
               add.fill(0);
               fd.item.content = Buffer.concat([fd.item.content, add]);
            } else if(len < currentSize) {
               fd.item.content = new Buffer(fd.item.content.toString('base64', 0, len), 'base64');
            }
         } else {
            throw new Error('EINVAL');
         }
      },
      _truncate: function() {
         var cb = this._getcb(arguments);
         try {
            cb(null, this._truncateSync.apply(this, arguments));
         } catch(e){
            cb(e);
         }
      },
      _openSync: function(p, flags, mode) {
         this._throwIfNotString(p);
         flags = parseFlags(flags);
         mode = mode || parseInt('0666', 8);

         var parent = this._lookupParent(p), name = path.basename(p), it;
         try {
            it = this._lookup(p);
         } catch(e) {}

         if(it) {
            // target path exists, is directory and write mode specified
            if(!(flags & O_RDONLY) && this._isDirectory(it)) {
               throw new Error('EISDIR');
            }
            // file exists, but exclusive creation requested
            if((flags & O_CREAT) && (flags & O_EXCL)) {
               throw new Error('EEXIST');
            }

            if(typeof it !== 'object' || !('content' in it)) {
               it = parent.items[name] = {
                  content: Buffer.isBuffer(it) ? it : new Buffer(it)
               };
            }

            if(!Buffer.isBuffer(it.content)) {
               it.content = new Buffer(it.content);
            }

            if(flags & O_TRUNC) {
               // reset file content if requested
               it.content = new Buffer("");
            }
         } else {
            if(this._isDirectory(parent)) {
               if(flags & O_CREAT) {
                  it = this._mkFile(parent, name, new Buffer(""), mode);
               } else {
                  // file is not exists and no creation flag
                  throw new Error('ENOENT');
               }
            } else {
               throw new Error('ENOTDIR');
            }

         }

         var fd = this._getFd();
         fdMap[fd] = {
            item: it,
            flags: flags,
            position: (flags & O_APPEND) ? it.content.length : 0
         };
         return fd;
      },
      _open: function() {
         var cb = this._getcb(arguments);
         try {
            cb(null, this._openSync.apply(this, arguments));
         } catch(e){
            cb(e);
         }
      },
      _fstatSync: function(fd) {
         this._throwIfNotNumber(fd);
         fd = getFdOrThrow(fd);
         return this._mkStat(fd.item);
      },
      _fstat: function() {
         var cb = this._getcb(arguments);
         try {
            cb(null, this._fstatSync.apply(this, arguments));
         } catch(e) {
            cb(e);
         }
      },
      _writeSync: function(fd, buffer, offset, length, position) {
         var start;

         this._throwIfNotNumber(fd);
         fd = getFdOrThrow(fd);
         if(fd.flags & O_RDONLY) {
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
      _write: function() {
         var cb = this._getcb(arguments);
         try {
            cb(null, this._writeSync.apply(this, arguments), arguments[1]);
         } catch(e) {
            cb(e);
         }
      },
      _readSync: function(fd, buffer, offset, length, position) {
         var start, end, item;

         this._throwIfNotNumber(fd);
         fd = getFdOrThrow(fd);
         if(fd.flags & O_WRONLY) {
            throw new Error('EACCESS');
         }
         offset = offset || 0;
         length = length || 0;

         if(length === 0)
            return 0;

         item = fd.item;

         start = position == null ? fd.position : (position || 0);
         end = Math.min(item.content.length, start + length);

         item.content.copy(buffer, offset, start, end);
         fd.position = end;

         return end - start;
      },
      _read: function() {
         var cb = this._getcb(arguments);
         try {
            cb(null, this._readSync.apply(this, arguments), arguments[1]);
         } catch(e) {
            cb(e);
         }
      },
      _closeSync: function(fd) {
         this._throwIfNotNumber(fd);
         getFdOrThrow(fd);
         delete fdMap[fd];
         this._releaseFd(fd);
      },
      _close: function() {
         var cb = this._getcb(arguments);
         try {
            cb(null, this._closeSync.apply(this, arguments));
         } catch(e) {
            cb(e);
         }
      }
   };

})();