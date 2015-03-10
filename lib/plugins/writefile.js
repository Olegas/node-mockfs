var path = require('path');
var errNoException = require('./../common').errNoException;

module.exports = {
    _writeFileSync: function (p, data, encoding) {
        var target, parent;
        try {
            target = this._lookup(p);
        } catch (e) {
            // if file is not exists, will create it
            if (e.message !== 'ENOENT') {
                throw errNoException(e.message, 'writeFileSync');
            }
        }
        if (target && this._isDirectory(target)) {
            throw errNoException('EISDIR', 'writeFileSync');
        }
        parent = this._lookupParent(p);
        if (this._isDirectory(parent)) {
            this._mkFile(parent, path.basename(p), this._createBuffer(data, encoding));
        } else
            throw errNoException('ENOTDIR', 'writeFileSync');
    },
    _writeFile: function () {
        var cb = this._getcb(arguments);
        try {
            cb(null, this._writeFileSync.apply(this, arguments));
        } catch (e) {
            cb(e);
        }
    }
};
