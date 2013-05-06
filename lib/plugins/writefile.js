var path = require('path');

module.exports = {
   _writeFileSync : function(p, data, encoding) {
      var parent = this._lookupParent(p);
      if(this._isDirectory(parent)) {
         this._mkFile(parent, path.basename(p), Buffer.isBuffer(data) ? data : new Buffer(data, encoding || 'utf8'));
      } else
         throw new Error('ENOTDIR');
   },
   _writeFile : function() {
      var cb = this._getcb(arguments);
      try {
         cb(null, this._writeFileSync.apply(this, arguments));
      } catch(e) {
         cb(e);
      }
   }
};