module.exports = {
    /**
     *
     * @returns {Function}
     */
    wrapSyncCall: function (method) {
        return function () {
            var cb = this._getcb(arguments),
                args = Array.prototype.slice.call(arguments),
                call;

            args.unshift(this);
            call = Function.prototype.bind.apply(this[method], args);
            process.nextTick(function () {
                try {
                    cb(null, call());
                } catch (e) {
                    cb(e);
                }
            });
        };
    },
    /**
     * @returns {Error} exception type Error, decorated with errno, code and syscall - as found in node fs
     */
    errNoException: function (errno, syscall) {
        var exception = new Error(errno,syscall);
        exception.code=exception.errno=errno;
        exception.syscall = syscall;
        return exception;
    }

};
