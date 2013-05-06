var fs = require('fs'),
    path = require('path'),
    wrap = require('./wrapfs.js'),
    util = require('util'),
    nop = function() {};
    mountPoints = {};

wrap(fs, mountPoints);

(function(){

   "use strict";

   function MockFS(spec) {
      this._mounted = false;
      this._path = null;
      this._spec = spec;
      this._options = {};
   }

   MockFS.prototype._getcb = function (args) {
      for(var i = args.length; i >= 0; i--) {
         if(typeof args[i] == 'function')
            return args[i];
      }
      return nop;
   };

   MockFS.prototype._lookup = function(p) {
      var root = this._spec, pathItem, specItem;

      if(typeof p != 'string') {
         throw new TypeError("path must be a string");
      }

      p = path.normalize(p).substr(this._path.length).split(path.sep);
      while(p.length) {
         pathItem = p.shift();
         if(root && root.items && pathItem in root.items) {
            root = root.items[pathItem]
         } else {
            throw new Error('ENOENT');
         }
      }
      return root;
   };

   MockFS.prototype._lookupParent = function(p) {
      if(typeof p != 'string') {
         throw new TypeError("path must be a string");
      }
      return this._lookup(path.join(path.dirname(p), path.sep));
   };

   MockFS.prototype._mkFile = function(target, name, content) {
      target[name] = content || '';
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