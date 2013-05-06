(function(){

   "use strict";

   function retFalse() { return false; }
   function retTrue() { return true; }

   function Stats(target, fs) {
      this.dev = 0;
      this.ino = 0;
      this.mode = target.mode || parseInt('0777', 8);
      this.nlink = 0;
      this.uid = target.uid || 0;
      this.gid = target.gid || 0;
      this.rdev = 0;
      this.size = (target.content || target).length;
      this.blksize = 1;
      this.blocks = this.size;
      this.atime = target.atime || fs._atime;
      this.ctime = target.ctime || fs._ctime;
      this.mtime = target.mtime || fs._mtime;

      this.isDirectory = fs._isDirectory(target) ? retTrue() : retFalse();
   }

   Stats.prototype.isFile = function() {
      return !this.isDirectory();
   };

   ['isBlockDevice', 'isCharacterDevice', 'isSymbolicLink', 'isFIFO', 'isSocket'].forEach(function(f){
      Stats.prototype[f] = retFalse();
   });

   module.exports = {
      _statSync: function(p) {
         return new Stats(this._lookup(p), this);
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
