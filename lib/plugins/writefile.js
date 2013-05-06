var path = require('path');

module.exports = {
   _writeFileSync : function(p, data, encoding) {
      var parent = this._lookupParent(p);
      this._mkFile(parent, path.basename(p), Buffer.isBuffer(data) ? data : new Buffer(data, encoding || 'utf8'));
   }
};