module.exports = {

   _existsSync: function(path) {
      try {
         this._lookup(path);
         return true;
      } catch (e) {
         return false;
      }
   },

   _exists: function(path) {
      var cb = this._getcb(arguments);
      try {
         this._lookup(path);
         cb(true);
      } catch (e) {
         cb(false);
      }
   }

};