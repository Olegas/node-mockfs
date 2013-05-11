(function(){

   "use strict";

   var pool = [];

   for(var i = 0; i < 255; i++) {
      pool[i] = 32767 - i;
   }

   /**
    * IDEA
    * keep real open files in FS mount point to work under real process limits
    * and receive real file descriptors
    */

   module.exports = {
      getFd: function() {
         if(pool.length === 0) {
            // too many open files
            throw new Error('EMFILE');
         }
         return pool.pop();
      },
      releaseFd: function() {
         Array.prototype.push.apply(pool, arguments);
         if(pool.length > 255) {
            throw new Error('EINSANITY');
         }
      },
      isSane: function() {
         return pool.length == 255;
      }
   }


})();