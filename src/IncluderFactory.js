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
 * @param {Transpiler} transpiler
 * @constructor
 */
function IncluderFactory(fs, transpiler) {
    /**
     * @type {fs}
     */
    this.fs = fs;
    /**
     * @type {Transpiler}
     */
    this.transpiler = transpiler;
}

_.extend(IncluderFactory.prototype, {
    /**
     * Creates an includer function for Uniter to use when including other PHP modules
     *
     * @param {FileSystem} fileSystem
     * @returns {function}
     */
    create: function (fileSystem) {
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
                realPath = fileSystem.realPath(filePath);

            try {
                phpCode = factory.fs.readFileSync(realPath).toString();
            } catch (error) {
                promise.reject('File "' + realPath + '" could not be read: ' + error.toString());
                return;
            }

            moduleFactory = factory.transpiler.transpile(phpCode, realPath);

            promise.resolve(moduleFactory);
        }

        return includer;
    }
});

module.exports = IncluderFactory;
