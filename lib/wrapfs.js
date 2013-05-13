var path = require('path');

(function(){

   "use strict";

   // path - with or without trailing slash
   function getFS(p, mnt) {
      var parts, toCheck;
      if(Object.keys(mnt).length === 0)
         return false;
      // file descriptor
      if(typeof p == 'number') {
         for(var mp in mnt) {
            if(mnt.hasOwnProperty(mp)) {
               if(mnt[mp].hasFd(p))
                  return mnt[mp];
            }
         }
         return false;
      }
      parts = path.resolve(p).split(path.sep);
      parts.shift(); // remove leading ""
      while(parts.length) {
         toCheck = path.resolve(path.sep + path.join.apply(path, parts)) + path.sep;
         if(toCheck in mnt)
            return mnt[toCheck];
         parts.pop();
      }
      return false;
   }

   module.exports = function wrap(fs, mnt) {

      for(var f in fs) {
         if(fs.hasOwnProperty(f)) {
            (function(orig, f){

               fs[f] = function(path) {
                  var mfs = getFS(path, mnt);
                  if(mfs && mfs['_' + f]) {
                     return mfs['_' + f].apply(mfs, arguments);
                  }
                  else {
                     return orig.apply(fs, arguments);
                  }
               }

            })(fs[f], f);
         }
      }

   }

})();