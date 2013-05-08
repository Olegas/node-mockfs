var fs = require('fs'),
    path = require('path'),
    wrap = require('./wrapfs.js'),
    util = require('util'),
    nop = function() {};
    mountPoints = {};

wrap(fs, mountPoints);

function throwIfNotString(s) {
   if(typeof s !== 'string') {
      throw new TypeError("path must be a string");
   }
}

(function(){

   "use strict";

   function MockFS(spec) {
      var now = new Date();
      this._mounted = false;
      this._path = null;
      this._spec = spec;
      this._atime = spec.atime || spec.time || now;
      this._ctime = spec.ctime || spec.time || now;
      this._mtime = spec.mtime || spec.time || now;
      this._options = {};
   }

   MockFS.prototype._getcb = function (args) {
      for(var i = args.length; i >= 0; i--) {
         if(typeof args[i] == 'function') {
            var f = args[i];
            delete args[i];
            return f;
         }
      }
      return nop;
   };

   MockFS.prototype._lookup = function(p) {
      var root = this._spec, pathItem;

      throwIfNotString(p);

      p = path.resolve(p).substr(this._path.length).split(path.sep);
      while(p.length) {
         pathItem = p.shift();
         if(pathItem) {
            if(root && root.items && pathItem in root.items) {
               root = root.items[pathItem]
            } else {
               throw new Error('ENOENT');
            }
         }
      }
      return root;
   };

   MockFS.prototype._createBuffer = function(data, encoding) {
      return Buffer.isBuffer(data) ? data : new Buffer(data, encoding || 'utf8');
   };

   MockFS.prototype._lookupParent = function(p) {
      throwIfNotString(p);
      return this._lookup(path.dirname(p));
   };

   MockFS.prototype._mkFile = function(target, name, content) {
      var now = new Date();
      target.items[name] = target.items[name] || {};
      target.items[name].content = content || '';
      target.items[name].ctime = now;
      target.items[name].mtime = now;
      target.items[name].atime = target.items[name].atime || now;
   };

   MockFS.prototype._toBuffer = function(mockf) {
      var data = typeof mockf == 'object' && mockf.content || mockf;
      return Buffer.isBuffer(data) ? data : new Buffer(data);
   };

   MockFS.prototype._isDirectory = function(mocki) {
      return mocki && typeof mocki.items == 'object' && !('content' in mocki);
   };

   MockFS.prototype.mount = function(p, opts) {
      if(this._mounted) {
         throw new Error('EALREADYMOUNED');
      }
      // mountpoint is always directory - add trailing path separator
      p = path.join(p, path.sep);
      if(mountPoints[p]) {
         throw new Error("EINUSE");
      }
      mountPoints[p] = this;
      this._path = p;
      this._mounted = true;
      this._options = opts;
   };

   MockFS.prototype.umount = function() {
      if(this._mounted) {
         delete mountPoints[this._path];
         this._path = null;
         this._mounted = false;
      }
   };

   MockFS.prototype.getMountPoint = function() {
      return this._path;
   };

   MockFS.mount = function(spec, path) {
      var fs = new MockFS(spec);
      fs.mount(path);
      return fs;
   };

   fs.readdirSync(path.join(__dirname, '/plugins')).forEach(function(f){
      var plugin = require(path.join(__dirname, 'plugins', f));
      Object.keys(plugin).forEach(function(mtd){
         MockFS.prototype[mtd] = plugin[mtd];
      });
   });

   module.exports = MockFS;

})();