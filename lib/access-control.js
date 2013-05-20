(function(){

   "use strict";

   module.exports = {
      parseModeFlags: function(mode) {
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
