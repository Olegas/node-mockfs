mockfs
======

MockFS - Mocking FS module implementation for testing purpouses.

Basic idea is to declare fs contents via JSON spec, mount it, and use through real `fs.*` functions like an ordinary fs.

```javascript
var fs = require('fs'),
    MockFS = require('mockfs'),
    spec, mfs;

spec = {
  items: {
    'file-buffer': new Buffer('qwerty'),
    'file-string': 'qwerty',
    'file-base64': new Buffer('cXdlcnR5', 'base64'),
    'file-alt': { 
      content: 'asobject'
    },
    'dir': {
      items: {
        'file-in-dir': 'inside directory'             
      }
    }
};

mfs = new MockFS(spec);
mfs.mount('/mnt/mock');

fs.existsSync('/mnt/mock/file-buffer'); // true
fs.readFileSync('/mnt/mock/file-string'); // querty
fs.readFile('/mnt/mock/dir/file-in-dir', function(e, r){
  if(r)
    console.log(r); // inside directory
});

mfs.umount('/mnt/mock');

fs.existsSync('/mnt/mock/file-buffer'); // false
```

