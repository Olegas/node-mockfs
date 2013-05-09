var path = require('path');

module.exports = {
   _mkdir: function() {
      var cb = this._getcb(arguments);
      try {
         cb(null, this._mkdirSync.apply(this, arguments));
      } catch (e) {
         cb(e);
      }
   },
   _mkdirSync: function(p, mode) {
      if(this._existsSync(p)) {
         throw new Error('EEXIST');
      } else {
         var parent = this._lookupParent(p);
         if(this._isDirectory(parent)) {
            this._mkDirectory(parent, p, mode);
         } else {
            throw new Error('ENOTDIR');
         }
      }
   }
};