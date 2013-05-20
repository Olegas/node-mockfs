(function(){

   "use strict";

   var read = 2, write = 1, ex = 0, ownPad = 6, grpPad = 3;

   function checkAccess(pad) {
      return function(uid, gid, mode, owner, ownerGrp) {
         var pat = 0;
         mode = this.parseMode(mode);

         if(owner && uid == owner) {
            pat |= (1 << pad) << ownPad;
         }
         if(ownerGrp && ownerGrp == gid) {
            pat |= (1 << pad) << grpPad;
         }
         pat |= (1 << pad);
         return !!(mode & pat);
      }
   }

   module.exports = {
      canRead: checkAccess(read),
      canWrite: checkAccess(write),
      canExec: checkAccess(ex),
      parseMode: function(mode) {
         var modes = 'rwx';

         if(typeof mode == 'string') {
            if(mode.length == 9) {
               var res = 0;
               mode.split('').forEach(function(m, pos){
                  if(m !== '-') {
                     if(modes.charAt(pos % 3) == m) {
                        res = res | 1;
                     } else {
                        throw new RangeError("Unknown mode char " + m);
                     }
                  }
                  if(pos < 8)
                     res = res << 1;
               });
               return res;
            } if(mode.charAt(0) == '0') {
               return parseInt(mode, 8);
            } else {
               throw new TypeError("Don't know how to parse " + mode);
            }
         } else if(typeof mode == 'number') {
            return mode;
         } else
            throw new TypeError("mode must be a string or number");
      }
   };

})();
