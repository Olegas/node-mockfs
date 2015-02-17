var path = require('path');
var errNoException = require('./../common').errNoException;

module.exports = {
   _rmdirSync: function(p) {
      var target = this._lookup(p);
      if(!this._isDirectory(target)) {
         throw errNoException('ENOTDIR','rmdirSync');
      }
      if(Object.keys(target.items).length > 0) {
         throw errNoException('ENOTEMPTY','rmdirSync');
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
