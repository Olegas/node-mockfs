var path = require('path');

module.exports = {
   _unlinkSync: function(p) {
      var target = this._lookup(p);
      if(this._isDirectory(target)) {
         throw new Error('EPERM');
      }
      this._removeFSItem(p);
   },
   _unlink: function() {
      var cb = this._getcb(arguments);
      try {
         this._unlinkSync.apply(this, arguments);
         cb(null);
      } catch(e) {
         cb(e);
      }
   }
};