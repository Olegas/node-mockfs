mockfs
======

[![Build Status](https://travis-ci.org/Olegas/mockfs.png)](https://travis-ci.org/Olegas/mockfs)
[![Coverage Status](https://coveralls.io/repos/Olegas/mockfs/badge.png?branch=master)](https://coveralls.io/r/Olegas/mockfs)

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
    spec, mfs;

spec = {
  items: {
    'file-buffer': new Buffer('qwerty'),    // specify content as Buffer
    'file-base64': new Buffer('cXdlcnR5', 'base64'),
    'file-string': 'qwerty',                // or as string
    'file-alt': {                           // alternative syntax
      uid: 'johndoe',                       // owner user, as login name or id
      gid: 300,                             // owner group
      mode: 0766,                           // access mode
      atime: new Date(),                    // specify a Date
      mtime: 500,                           // specify a delta (from a point of FS creation time) ?
      ctime: -500            
      content: 'asobject'                   // file content
    },
    'dir': {
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

mfs.umount('/mnt/mock');

fs.existsSync('/mnt/mock/file-buffer'); // false
```

