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
 * @param {Process} process
 * @constructor
 */
function IO(process) {
    /**
     * @type {Process}
     */
    this.process = process;
}

_.extend(IO.prototype, {
    /**
     * Hooks the IO for a PHP engine up to this process' std pipes
     *
     * @param {Engine} phpEngine
     */
    install: function (phpEngine) {
        var io = this;

        phpEngine.getStdout().on('data', function (data) {
            io.process.stdout.write(data);
        });

        phpEngine.getStderr().on('data', function (data) {
            io.process.stderr.write(data);
        });
    }
});

module.exports = IO;
