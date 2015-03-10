var path = require('path');
var errNoException = require('./../common').errNoException;

module.exports = {
   _unlinkSync: function(p) {
      var target = this._lookup(p);
      if(this._isDirectory(target)) {
         throw errNoException('EPERM','unlinkSync');
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
