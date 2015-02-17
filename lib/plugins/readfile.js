var errNoException = require('./../common').errNoException;

module.exports = {

   _readFile: function() {
      var cb = this._getcb(arguments);
      try {
         cb(null, this._readFileSync.apply(this, arguments));
      } catch (e) {
        //e is already converted in sync function
         cb(e);
      }
   },

   _readFileSync: function(path, encoding) {
      var f = this._lookup(path), buf;
      if(!this._isDirectory(f)) {
         buf = this._toBuffer(f);
         return encoding ? buf.toString(encoding) : buf;
      } else
         throw errNoException('EISDIR','readFileSync');
   }
};
