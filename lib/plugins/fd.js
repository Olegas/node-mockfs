(function(){

   "use strict";

   var constants = {
      O_RDONLY: 0x0000,
      O_WRONLY: 0x0001,
      O_RDWR:   0x0002,
      O_APPEND: 0x0008,
      O_CREAT:  0x0200,
      O_TRUNC:  0x0400,
      O_EXCL:   0x0800
   };

   try {
      constants = process.binding('constants'); // magic...
   } catch(e) {}


   var path = require('path'),
       common = require('./../common'),
       fdMap = {},
       O_RDWR = constants.O_RDWR,
       O_RDONLY = constants.O_RDONLY,
       O_TRUNC = constants.O_TRUNC,
       O_CREAT = constants.O_CREAT,
       O_WRONLY = constants.O_WRONLY,
       O_EXCL = constants.O_EXCL,
       O_APPEND = constants.O_APPEND;

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
      _getFdOrThrow: function(fd) {
         this._throwIfNotNumber(fd);
         if(fd > 0 && fd in fdMap) {
            return fdMap[fd];
         } else {
            throw new Error('EBADF');
         }
      },
      _fsyncSync: function(fd) {
         this._getFdOrThrow(fd);
      },
      _fsync: common.wrapSyncCall('_fsyncSync'),
      _truncateSync: function(fd, len) {
         this._throwIfFSReadOnly();
         fd = this._getFdOrThrow(fd);
         len = len || 0;
         if(fd.flags !== O_RDONLY) {
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
      _truncate:common.wrapSyncCall('_truncateSync'),
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
            if(flags !== O_RDONLY && this._isDirectory(it)) {
               throw new Error('EISDIR');
            }
            // file exists, but exclusive creation requested
            if((flags & O_CREAT) && (flags & O_EXCL)) {
               throw new Error('EEXIST');
            }

            // 'it' is a string, or an object, but has no 'content' and 'items' in (it is a Buffer)
            if(typeof it !== 'object' || !('content' in it) && !('items' in it)) {
               it = parent.items[name] = {
                  content: Buffer.isBuffer(it) ? it : new Buffer(it)
               };
            }

            // 'it' has content, but it is not a Buffer
            if('content' in it && !Buffer.isBuffer(it.content)) {
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
      _open: common.wrapSyncCall('_openSync'),
      _fstatSync: function(fd) {
         fd = this._getFdOrThrow(fd);
         return this._mkStat(fd.item);
      },
      _fstat: common.wrapSyncCall('_fstatSync'),
      _writeSync: function(fd, buffer, offset, length, position) {
         var start;

         fd = this._getFdOrThrow(fd);
         if(fd.flags === O_RDONLY) {
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
         var cb = this._getcb(arguments),
            args = Array.prototype.slice.call(arguments),
            call;

         args.unshift(this);
         call = Function.prototype.bind.apply(this._writeSync, args);
         process.nextTick(function(){
            try {
               cb(null, call(), arguments[1]);
            } catch(e) {
               cb(e);
            }
         });
      },
      _readSync: function(fd, buffer, offset, length, position) {
         var start, end, item;

         fd = this._getFdOrThrow(fd);
         if(fd.flags & O_WRONLY) {
            throw new Error('EBADF');
         }
         if(this._isDirectory(fd.item)) {
            throw new Error('EISDIR');
         }
         offset = offset || 0;
         length = length || 0;

         if(length === 0)
            return 0;

         item = fd.item;

         start = position < 0 || position === null || isNaN(Number(position)) ? fd.position : position;
         end = Math.min(item.content.length, start + length);

         item.content.copy(buffer, offset, start, end);
         fd.position = end;

         return end - start;
      },
      _read: function() {
         var cb = this._getcb(arguments),
            args = Array.prototype.slice.call(arguments),
            call;

         args.unshift(this);
         call = Function.prototype.bind.apply(this._readSync, args);
         process.nextTick(function(){
            try {
               cb(null, call(), arguments[1]);
            } catch(e) {
               cb(e);
            }
         });
      },
      _closeSync: function(fd) {
         this._getFdOrThrow(fd);
         delete fdMap[fd];
         this._releaseFd(fd);
      },
      _close: common.wrapSyncCall('_closeSync')
   };

})();