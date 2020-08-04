/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash');

/**
 * @param {ConfigSet} dotPHPConfigSet
 * @param {Process} process
 * @constructor
 */
function IO(dotPHPConfigSet, process) {
    /**
     * @type {ConfigSet}
     */
    this.dotPHPConfigSet = dotPHPConfigSet;
    /**
     * @type {Process}
     */
    this.process = process;
}

_.extend(IO.prototype, {
    /**
     * Hooks the IO for a PHP engine up to this process' standard streams
     *
     * @param {Environment} environment
     */
    install: function (environment) {
        var io = this;

        if (io.dotPHPConfigSet.getBoolean('stdio', true) === false) {
            // Standard I/O has been disabled in config - nothing to do
            return;
        }

        environment.getStdout().on('data', function (data) {
            io.process.stdout.write(data);
        });

        environment.getStderr().on('data', function (data) {
            io.process.stderr.write(data);
        });
    }
});

module.exports = IO;
