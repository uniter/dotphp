/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

/*global WeakSet */
'use strict';

var _ = require('microdash');

/**
 * @param {Process} process
 * @constructor
 */
function IO(process) {
    /**
     * @type {Process}
     */
    this.process = process;
    /**
     * @type {WeakMap}
     */
    this.stdoutsAlreadyInstalledOnto = new WeakSet();
}

_.extend(IO.prototype, {
    /**
     * Hooks the IO for a PHP engine up to this process' standard streams
     *
     * @param {Engine} phpEngine
     */
    install: function (phpEngine) {
        var io = this;

        if (io.stdoutsAlreadyInstalledOnto.has(phpEngine.getStdout())) {
            /*
             * This stdout/stderr pair has already had its console IO installed - nothing to do
             * (when a module has been required from another, it will inherit these streams from the caller,
             * so we need to do this to avoid installing the IO forwarding twice)
             */
            return;
        }

        phpEngine.getStdout().on('data', function (data) {
            io.process.stdout.write(data);
        });

        phpEngine.getStderr().on('data', function (data) {
            io.process.stderr.write(data);
        });

        // Mark as installed so it can be excluded next time
        io.stdoutsAlreadyInstalledOnto.add(phpEngine.getStdout());
    }
});

module.exports = IO;
