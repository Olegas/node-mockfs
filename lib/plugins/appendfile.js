var path = require('path');
var errNoException = require('./../common').errNoException;

module.exports = {
    _appendFileSync: function (p, data, encoding) {
        var current;

        try {
            current = this._readFileSync(p);
        } catch (e) {
            if (e.message !== 'ENOENT')
                throw errNoException(e.message, "appendFileSync");
        }

        data = this._createBuffer(data, encoding);
        if (current)
            data = Buffer.concat([current, data]);
        this._writeFileSync(p, data);

    },
    _appendFile: function () {
        var cb = this._getcb(arguments);
        try {
            cb(null, this._appendFileSync.apply(this, arguments));
        } catch (e) {
            cb(e);
        }
    }
};
