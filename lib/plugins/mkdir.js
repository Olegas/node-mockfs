var path = require('path');
var errNoException = require('./../common').errNoException;
module.exports = {
   _mkdir: function() {
      var cb = this._getcb(arguments);
      try {
         cb(null, this._mkdirSync.apply(this, arguments));
      } catch (e) {
         cb(errNoException(e.message,'mkdir') );
      }
   },
   _mkdirSync: function(p, mode) {
      if(this._existsSync(p)) {
         throw errNoException('EEXIST','mkdirSync');
      } else {
         var parent = this._lookupParent(p);
         if(this._isDirectory(parent)) {
            this._mkDirectory(parent, p, mode);
         } else {
            throw errNoException('ENOTDIR','mkdirSync');
         }
      }
   }
};
