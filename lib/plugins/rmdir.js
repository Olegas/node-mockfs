var path = require('path');

module.exports = {
   _rmdirSync: function(p) {
      var target = this._lookup(p);
      if(!this._isDirectory(target)) {
         throw new Error('ENOTDIR');
      }
      if(Object.keys(target.items).length > 0) {
         throw new Error('ENOTEMPTY');
      }
      this._removeFSItem(p);
   },
   _rmdir: function() {
      var cb = this._getcb(arguments);
      try {
         this._rmdirSync.apply(this, arguments);
         cb(null);
      } catch(e) {
         cb(e);
      }
   }
};