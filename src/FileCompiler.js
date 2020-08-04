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
 * @param {PathMapper} pathMapper
 * @param {Compiler} compiler
 * @constructor
 */
function FileCompiler(fs, pathMapper, compiler) {
    /**
     * @type {Compiler}
     */
    this.compiler = compiler;
    /**
     * @type {fs}
     */
    this.fs = fs;
    /**
     * @type {PathMapper}
     */
    this.pathMapper = pathMapper;
}

_.extend(FileCompiler.prototype, {
    /**
     * Reads and compiles the specified PHP file to a module factory
     *
     * @param {string} filePath
     * @param {Mode} mode
     * @returns {Function}
     */
    compile: function (filePath, mode) {
        var requirer = this,
            effectiveFilePath = requirer.pathMapper.map(filePath),
            phpCode = requirer.fs.readFileSync(effectiveFilePath).toString();

        return requirer.compiler.compile(phpCode, filePath, mode);
    }
});

module.exports = FileCompiler;
