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
     * @returns {function}
     */
    create: function (compiler, fileSystem) {
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
                realPath,
                effectiveRealPath;

            try {
                realPath = fileSystem.realPath(filePath);
            } catch (error) {
                promise.reject(new Error(error.code === 'ENOENT' ? 'No such file or directory' : error.message));
                return;
            }

            effectiveRealPath = factory.pathMapper.map(realPath);

            try {
                phpCode = factory.fs.readFileSync(effectiveRealPath).toString();
            } catch (error) {
                promise.reject(new Error(error.code === 'ENOENT' ? 'No such file or directory' : error.message));
                return;
            }

            moduleFactory = compiler.compile(phpCode, realPath);

            promise.resolve(moduleFactory);
        }

        return includer;
    }
});

module.exports = IncluderFactory;
