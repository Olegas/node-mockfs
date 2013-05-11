(function(){

   "use strict";

   module.exports = {
      _statSync: function(p) {
         return this._mkStat(this._lookup(p));
      },
      _stat: function() {
         var cb = this._getcb(arguments);
         try {
            cb(null, this._statSync.apply(this, arguments));
         } catch(e) {
            cb(e);
         }
      }
   };

})();
