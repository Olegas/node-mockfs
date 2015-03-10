var path = require('path');
var errNoException = require('./../common').errNoException;

module.exports = {
   _renameSync: function(src, dst) {
      var iSrc, iDst, iSrcParent, iDstParent, srcName, dstName;
      this._throwIfNotString(src, dst);

      var lastComp = path.basename(src);
      if(lastComp === '.' || lastComp === '..') {
         throw errNoException('EINVAL','renameSync');
      }

      src = path.resolve(src);
      dst = path.resolve(dst);

      if(dst.indexOf(this.getMountPoint()) !== 0) {
          throw errNoException('EXDEV','renameSync');
      }

      if(dst.indexOf(path.join(src, path.sep)) === 0) {
            throw errNoException('EINVAL','renameSync');
      }

      iSrc = this._lookup(src);
      try {
         iDst = this._lookup(dst);
      } catch(e) {}

      // destination exists
      if(iDst !== undefined) {
         // source is a directory
         if(this._isDirectory(iSrc)) {
            if(!this._isDirectory(iDst)) {
               // but destination isn't
               throw errNoException('ENOTDIR','renameSync');
            } else {
               // destination is direcotry
               if(Object.keys(iDst.items).length > 0) {
                  // but isn't empty
                   throw errNoException('ENOTEMPTY','renameSync');
               }
            }
         } else {
            // source is a file
            if(this._isDirectory(iDst)) {
               // but destination is a directory
               throw errNoException('EISDIR','renameSync');
            }
         }
      }

      this._throwIfFSReadOnly();

      iSrcParent = this._lookupParent(src);
      iDstParent = this._lookupParent(dst);
      srcName = path.basename(src);
      dstName = path.basename(dst);

      iDstParent.items[dstName] = iSrc;
      delete iSrcParent.items[srcName];

   },
   _rename: function() {
      var cb = this._getcb(arguments);
      try {
         this._renameSync.apply(this, arguments);
         cb(null);
      } catch(e) {
          // e is alredy converted to exception with errorcode
         cb(e);
      }
   }
};
