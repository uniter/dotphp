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
function Requirer(fs, compiler) {
    /**
     * @type {Compiler}
     */
    this.compiler = compiler;
    /**
     * @type {fs}
     */
    this.fs = fs;
}

_.extend(Requirer.prototype, {
    /**
     * Requires, executes and returns the result of the specified PHP file
     *
     * @param {string} filePath
     * @param {Mode} mode
     * @return {Function}
     */
    require: function (filePath, mode) {
        var requirer = this,
            phpCode = requirer.fs.readFileSync(filePath).toString();

        return requirer.compiler.compile(phpCode, filePath, mode);
    }
});

module.exports = Requirer;
