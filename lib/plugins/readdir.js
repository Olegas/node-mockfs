var errNoException = require('./../common').errNoException;

module.exports = {
   _readdir: function() {
      var cb = this._getcb(arguments);
      try {
         cb(null, this._readdirSync.apply(this, arguments));
      } catch(e) {
          // e is already converted in sync function
         cb(e);
      }
   },
   _readdirSync: function(p) {
      var root = this._lookup(p);
      if(this._isDirectory(root)) {
         return Object.keys(root.items);
      } else
         throw errNoException("ENOTDIR",'readdir');
   }
};
