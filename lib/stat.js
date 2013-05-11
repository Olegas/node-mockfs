(function(){

   "use strict";

   function retFalse() { return false; }
   function retTrue() { return true; }
   function mkTime(v, ref) {
      if(typeof v == 'string') {
         if('+-'.indexOf(v.charAt(0)) !== -1) {
            return new Date(+ref + (+v));
         }
         return new Date(v);
      }
      if(typeof v == 'number') {
         if(v < 0) {
            return new Date(+ref + v);
         } else
            return new Date(v);
      }
      if(v instanceof Date)
         return v;
      return NaN;
   }

   function Stats(target, fs) {
      this.dev = 0;
      this.ino = 0;
      this.mode = target.mode || parseInt('0777', 8);
      this.nlink = 0;
      this.uid = target.uid || 0;
      this.gid = target.gid || 0;
      this.rdev = 0;
      this.size = (target.content || target).length || 0;
      this.blksize = 1;
      this.blocks = this.size;
      this.atime = mkTime(target.atime || fs._atime, fs._atime);
      this.ctime = mkTime(target.ctime || fs._ctime, fs._ctime);
      this.mtime = mkTime(target.mtime || fs._mtime, fs._mtime);

      this.isDirectory = fs._isDirectory(target) ? retTrue : retFalse;
   }

   Stats.prototype.isFile = function() {
      return !this.isDirectory();
   };

   ['isBlockDevice', 'isCharacterDevice', 'isSymbolicLink', 'isFIFO', 'isSocket'].forEach(function(f){
      Stats.prototype[f] = retFalse;
   });

   module.exports = Stats;

})();