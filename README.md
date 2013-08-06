mockfs
======

[![Build Status](https://travis-ci.org/Olegas/mockfs.png)](https://travis-ci.org/Olegas/mockfs)
[![Coverage Status](https://coveralls.io/repos/Olegas/mockfs/badge.png?branch=master)](https://coveralls.io/r/Olegas/mockfs)
[![NPM version](https://badge.fury.io/js/mockfs.png)](http://badge.fury.io/js/mockfs)
[![Dependency Status](https://gemnasium.com/Olegas/mockfs.png)](https://gemnasium.com/Olegas/mockfs)


MockFS - Mocking FS module implementation for testing purpouses.

Basic idea is to declare file system contents via JSON spec, mount it, and use through real `fs.*` functions like an ordinary one.

```javascript
/**
 * /
 *  file-buffer
 *  file-base64
 *  file-string
 *  file-alt
 *  dir/
 *      file-in-dir
 */
var fs = require('fs'),
    MockFS = require('mockfs'),
    spec, mfs, fd;

spec = {
  time: 'Tue May 07 2013 17:09:57 GMT+0400' // global default time for any FS item, optional
  ctime: new Date(),                        // creation time default, optional
/*atime: ...,                               // atime and ctime is not set
  mtime: ...,*/                             // value is taken from FS defaults (time)
  items: {
    'file-buffer': new Buffer('qwerty'),    // specify content as Buffer
    'file-base64': new Buffer('cXdlcnR5', 'base64'), // buffer with encoding
    'file-string': 'qwerty',                // or as string
    'file-alt': {                           // alternative syntax
      uid: 'johndoe',                       // owner user, as login name or id
      gid: 300,                             // owner group
      mode: 0766,                           // access mode
      atime: new Date(),                    // Date instance
      mtime: 1000255364,                    // timestamp
      ctime: "-500"                         // number with a sign (+/-) - delta from fs default value
      content: 'asobject'                   // file content
    },
    'dir': {                                // directory - always an object with items property (which is object too)
      atime: 'Tue May 07 2013 17:09:57 GMT+0400' // Date as string
      mtime: "+500",                        // stats, uid, gid, mode - on directories too
    /*ctime*/                               // ctime is not set, value taken from FS defaults  
      items: {                              // directory contents
        'file-in-dir': 'inside directory'             
      }
    }
};

mfs = new MockFS(spec);
mfs.mount('/mnt/mock');

fs.existsSync('/mnt/mock/file-buffer'); // true
fs.readFileSync('/mnt/mock/file-string').toString(); // "qwerty"
fs.readFile('/mnt/mock/dir/file-in-dir', function(e, r){
    Buffer.isBuffer(r); // true
    r.toString(); // "inside directory"
});

// file descriptors is also works
fs.open('/mnt/mock/file-base64', 'r', function(e, fd){
    if(fd) {
        var buf = new Buffer(100);
        fs.read(fd, buf, 0, 100, null, function(e, bytesRead){
            console.log(bytesRead); // 6
            console.log(buf.toString('utf8', 0, bytesRead)); // qwerty
            fs.closeSync(fd);
        });    
    }
});

mfs.umount('/mnt/mock');

fs.existsSync('/mnt/mock/file-buffer'); // false
```

Implemented by wrapping bundled `fs` module's basic functions (file descriptors handling, stat, rename/delete files/directories).
So, functions as `createReadStream`, `appendFileSync` and so are supported "out of the box" without any wrapping.

Currently, NodeJS v0.8+ is supported.

TODO
-----------------

 - Support legacy interfaces
 - Access rights check (read/write/search permissions)
 - *chown(Sync), *chmod(Sync) functions
 - Links support
 - (un)watch(File) support
 - `mirror` utility to create MockFS specs from real file systems
 - Integrate with some date parsing library for convinient atime/ctime/mtime specification

Roadmap
-------

### v0.2

 - Access rights check (read/write/search permissions)
 - *chown(Sync), *chmod(Sync) functions

### v0.3

 - Links support
 - (un)watch(File) support

### v1.0

 - Support legacy interfaces
 - Pass NodeJS test suite


Similar libraries
------------------
 - [fake-fs](https://github.com/eldargab/node-fake-fs) by [Eldar Gabdullin](https://github.com/eldargab)


