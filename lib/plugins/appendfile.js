var path = require('path');

module.exports = {
   _appendFileSync: function(p, data, encoding) {
      var current;

      try {
         current = this._readFileSync(p);
      } catch(e) {
         if(e.message !== 'ENOENT')
            throw e;
      }

      data = Buffer.isBuffer(data) ? data : new Buffer(data, encoding || 'utf8');
      if(current)
         data = Buffer.concat([current, data]);
      this._writeFileSync(p, data);

   },
   _appendFile: function() {
      var cb = this._getcb(arguments);
      try {
         cb(null, this._appendFileSync.apply(this, arguments));
      } catch(e) {
         cb(e);
      }
   }
};