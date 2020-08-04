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
 * @param {fs} fs
 * @param {PathMapper} pathMapper
 * @constructor
 */
function IncluderFactory(fs, pathMapper) {
    /**
     * @type {fs}
     */
    this.fs = fs;
    /**
     * @type {PathMapper}
     */
    this.pathMapper = pathMapper;
}

_.extend(IncluderFactory.prototype, {
    /**
     * Creates an includer function for Uniter to use when including other PHP modules
     *
     * @param {Compiler} compiler
     * @param {FileSystem} fileSystem
     * @param {Mode} mode
     * @returns {function}
     */
    create: function (compiler, fileSystem, mode) {
        var factory = this;

        /**
         * Includer function passed as the `include` option for the runtime
         *
         * @param {string} filePath
         * @param {{resolve: {function}, reject: {function}}} promise
         */
        function includer(filePath, promise) {
            var moduleFactory,
                phpCode,
                realPath = fileSystem.realPath(filePath),
                effectiveRealPath = factory.pathMapper.map(realPath);

            try {
                phpCode = factory.fs.readFileSync(effectiveRealPath).toString();
            } catch (error) {
                promise.reject('File "' + effectiveRealPath + '" could not be read: ' + error.toString());
                return;
            }

            moduleFactory = compiler.compile(phpCode, realPath, mode);

            promise.resolve(moduleFactory);
        }

        return includer;
    }
});

module.exports = IncluderFactory;
