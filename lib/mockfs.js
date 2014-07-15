var fs = require('fs'),
    path = require('path'),
    wrap = require('./wrapfs.js'),
    fdmgr = require('./fd-manager.js'),
    Stats = require('./stat.js'),
    nop = function() {},
    mountPoints = {},
    plugins = [ 'chown', 'exists', 'fd', 'mkdir', 'readdir', 'rename', 'rmdir', 'stat', 'unlink', 'utimes' ];

// Tessel support
if (process.platform == 'colony') {
   plugins.push('readfile', 'writefile', 'appendfile');
}

wrap(fs, mountPoints);

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
      this._fdManager = fdmgr;
      this._fds = [];
   }

   MockFS.prototype._throwIfNotString = function() {
      for(var i = 0, l = arguments.length; i < l; i++) {
         if(typeof arguments[i] !== 'string') {
            throw new TypeError("path must be a string");
         }
      }
   };

   MockFS.prototype._throwIfNotNumber = function() {
      for(var i = 0, l = arguments.length; i < l; i++) {
         if(typeof arguments[i] !== 'number') {
            throw new TypeError("bad argument");
         }
      }
   };

   MockFS.prototype._throwIfFSReadOnly = function() {
      if(this._options.readonly) {
         throw new Error('EROFS');
      }
   };

   MockFS.prototype._getFd = function() {
      var fd = this._fdManager.getFd();
      this._fds.push(fd);
      return fd;
   };

   MockFS.prototype._releaseFd = function(fd) {
      this._fdManager.releaseFd(fd);
      this._fds.splice(this._fds.indexOf(fd), 1);
   };

   MockFS.prototype.hasFd = function(fd) {
      return this._fds.indexOf(fd) !== -1;
   };

   MockFS.prototype._removeFSItem = function(p) {
      this._throwIfFSReadOnly();
      var parent = this._lookupParent(p);
      delete parent.items[path.basename(p)];
   };

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

   MockFS.prototype._resolveAndRelate = function(p) {
      return path.resolve(p).substr(this._path.length);
   };

   MockFS.prototype._lookup = function(p) {
      var root = this._spec, pathItem;

      this._throwIfNotString(p);

      p = this._resolveAndRelate(p).split(path.sep);
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
      this._throwIfNotString(p);
      return this._lookup(path.dirname(p));
   };

   MockFS.prototype._mkDirectory = function(parent, p, mode) {
      this._throwIfFSReadOnly();
      var dirName = path.basename(p);
      parent.items[dirName] = {
         mode: mode || parseInt("0777", 8),
         ctime: new Date(),
         atime: new Date(),
         mtime: new Date(),
         items: {}
      };
   };

   MockFS.prototype._mkFile = function(target, name, content, mode) {
      var now = new Date();
      this._throwIfFSReadOnly();
      target.items[name] = target.items[name] || {};
      target.items[name].content = content || '';
      target.items[name].mode = mode || parseInt('0755', 8);
      target.items[name].ctime = now;
      target.items[name].mtime = now;
      target.items[name].atime = target.items[name].atime || now;

      return target.items[name];
   };

   MockFS.prototype._toBuffer = function(mockf) {
      var data = typeof mockf == 'object' && mockf.content || mockf;
      return Buffer.isBuffer(data) ? data : new Buffer(data);
   };

   MockFS.prototype._isDirectory = function(mocki) {
      return mocki && typeof mocki.items == 'object' && !('content' in mocki);
   };

   MockFS.prototype._mkStat = function(item) {
      return new Stats(item, this);
   };

   MockFS.prototype.mount = function(p, opts) {
      if(this._mounted) {
         throw new Error('EALREADYMOUNED');
      }
      // mountpoint is always directory - add trailing path separator
      p = path.join(path.resolve(p), path.sep);
      if(mountPoints[p]) {
         throw new Error("EINUSE");
      }
      mountPoints[p] = this;
      this._path = p;
      this._mounted = true;
      this._options = opts || {};
   };

   MockFS.prototype.umount = function() {
      if(this._mounted) {
         this._fdManager.releaseFd.apply(this._fdManager, this._fds);
         delete mountPoints[this._path];
         this._path = null;
         this._mounted = false;
      }
   };

   MockFS.prototype.getMountPoint = function() {
      return this._path;
   };

   MockFS.mount = function(spec, path, options) {
      var fs = new MockFS(spec);
      fs.mount(path, options);
      return fs;
   };

   plugins.forEach(function(pluginName){
      var plugin = require('.' + path.sep + 'plugins' + path.sep + pluginName);
      Object.keys(plugin).forEach(function(mtd){
         MockFS.prototype[mtd] = plugin[mtd];
      });
   });

   module.exports = MockFS;

})();