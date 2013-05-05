(function(){

   "use strict";

   function getFS(path, mnt) {
      var lastP = "", points = Object.keys(mnt);
      if(points.length === 0)
         return false;
      points.forEach(function(p){
         if(path.indexOf(mnt[p].getMountPoint()) === 0) {
           if(p > lastP) {
              lastP = p;
           }
         }
      });
      return mnt[lastP] || false;
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

})()