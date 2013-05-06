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
            var dirName = path.basename(p);
            parent.items[dirName] = {
               mode: mode || parseInt("0777", 8),
               items: {}
            }
         } else {
            throw new Error('ENOTDIR');
         }
      }
   }
};