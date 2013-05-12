var path = require('path'),
    common = require('./../common');

module.exports = {
   _futimesSync: function(fd, atime, mtime) {
      fd = this._getFdOrThrow(fd);
      fd.item.atime = atime;
      fd.item.mtime = mtime;
   },
   _futimes: common.wrapSyncCall('_futimesSync'),
   _utimesSync: function(p, atime, mtime) {
      var t = this._lookup(p);
      // convert to object form
      if(!this._isDirectory(t) && (Buffer.isBuffer(t) || typeof t == 'string')) {
         var parent = this._lookupParent(p);
         t = parent.items[path.basename(p)] = {
            content: t
         }
      }
      t.atime = atime;
      t.mtime = mtime;
   },
   _utimes: common.wrapSyncCall('_utimesSync')
};