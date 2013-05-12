module.exports = {
   /**
    *
    * @returns {Function}
    */
   wrapSyncCall: function(method){
      return function() {
         var cb = this._getcb(arguments),
             args = Array.prototype.slice.call(arguments),
             call;

         args.unshift(this);
         call = Function.prototype.bind.apply(this[method], args);
         process.nextTick(function(){
            try {
               cb(null, call());
            } catch(e) {
               cb(e);
            }
         });
      }
   }
};