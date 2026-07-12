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
 * @param {fs} fs FS module
 * @param {PathMapper} pathMapper
 * @param {Stubber} stubber
 * @param {Compiler} compiler
 * @constructor
 */
function FileCompiler(fs, pathMapper, stubber, compiler) {
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
    /**
     * @type {Stubber}
     */
    this.stubber = stubber;
}

_.extend(FileCompiler.prototype, {
    /**
     * Reads and compiles the specified PHP file to a module factory.
     * If the file has a stub configured, the stub PHP code is compiled instead.
     *
     * @param {string} filePath
     * @returns {Function}
     */
    compile: function (filePath) {
        var requirer = this,
            effectiveFilePath = requirer.pathMapper.map(filePath),
            stubCode = requirer.stubber.getStub(effectiveFilePath),
            phpCode;

        if (stubCode !== null) {
            phpCode = stubCode;
        } else {
            phpCode = requirer.fs.readFileSync(effectiveFilePath).toString();
        }

        return requirer.compiler.compile(phpCode, filePath);
    }
});

module.exports = FileCompiler;
