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
 * @param {fs} FS module
 * @param {Compiler} compiler
 * @constructor
 */
function Requirer(fileCompiler) {
    /**
     * @type {FileCompiler}
     */
    this.fileCompiler = fileCompiler;
}

_.extend(Requirer.prototype, {
    /**
     * Requires, executes and returns the result of the specified PHP file (in synchronous mode)
     * or a promise to be resolved with its result (in asynchronous mode)
     *
     * @param {string} filePath
     * @param {Mode} mode
     * @returns {Promise|Value}
     */
    require: function (filePath, mode) {
        return this.fileCompiler.compile(filePath, mode)().execute();
    }
});

module.exports = Requirer;
