/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    Mode = require('./Mode');

/**
 * @param {RequireExtension} requireExtension
 * @param {FileCompiler} fileCompiler
 * @param {Bootstrapper} bootstrapper
 * @param {Evaluator} evaluator
 * @param {Transpiler} transpiler
 * @param {Function} jsBeautify Beautify NPM package
 * @param {StdinReader} stdinReader
 * @constructor
 */
function DotPHP(
    requireExtension,
    fileCompiler,
    bootstrapper,
    evaluator,
    transpiler,
    jsBeautify,
    stdinReader
) {
    /**
     * @type {Bootstrapper}
     */
    this.bootstrapper = bootstrapper;
    /**
     * @type {Evaluator}
     */
    this.evaluator = evaluator;
    /**
     * @type {FileCompiler}
     */
    this.fileCompiler = fileCompiler;
    /**
     * @type {Function}
     */
    this.jsBeautify = jsBeautify;
    /**
     * @type {RequireExtension}
     */
    this.requireExtension = requireExtension;
    /**
     * @type {StdinReader}
     */
    this.stdinReader = stdinReader;
    /**
     * @type {Transpiler}
     */
    this.transpiler = transpiler;
}

_.extend(DotPHP.prototype, {
    /**
     * Requires any bootstrap file(s), if specified in config, in sequence (if multiple are provided).
     * The returned promise will only be resolved once all have completed (or once the first module
     * to reject has done so)
     *
     * @returns {Promise}
     */
    bootstrap: function () {
        return this.bootstrapper.bootstrap();
    },

    /**
     * Requires any bootstrap file(s), if specified in config, in sequence (if multiple are provided
     *
     * @throws {Error} Throws if requiring any of the configured bootstrap files results in an error
     */
    bootstrapSync: function () {
        this.bootstrapper.bootstrapSync();
    },

    /**
     * Executes and returns the result of the specified PHP code asynchronously
     *
     * @param {string} phpCode
     * @param {string|null} filePath
     * @returns {Promise}
     */
    evaluate: function (phpCode, filePath) {
        return this.evaluator.evaluate(phpCode, filePath, Mode.asynchronous());
    },

    /**
     * Executes and returns the result of the specified PHP code synchronously
     *
     * @param {string} phpCode
     * @param {string|null} filePath
     * @returns {Value}
     */
    evaluateSync: function (phpCode, filePath) {
        return this.evaluator.evaluate(phpCode, filePath, Mode.synchronous());
    },

    /**
     * Reads PHP code from stdin and returns a promise to be resolved when it has all been received
     *
     * @returns {Promise}
     */
    readStdin: function () {
        return this.stdinReader.read();
    },

    /**
     * Registers the `.php` extension handler for Node
     *
     * @param {object} options
     * @returns {Promise|null}
     */
    register: function (options) {
        return this.requireExtension.install(options);
    },

    /**
     * Fetches a PHP module factory from its full/real path in asynchronous mode
     *
     * @param {string} filePath
     * @returns {Function}
     */
    require: function (filePath) {
        return this.fileCompiler.compile(filePath, Mode.asynchronous());
    },

    /**
     * Fetches a PHP module factory from its full/real path in synchronous mode
     *
     * @param {string} filePath
     * @returns {Function}
     */
    requireSync: function (filePath) {
        return this.fileCompiler.compile(filePath, Mode.synchronous());
    },

    /**
     * Transpiles the specified PHP code to JavaScript
     *
     * @param {string} phpCode
     * @param {string|null} filePath
     * @returns {string}
     */
    transpile: function (phpCode, filePath) {
        var dotPHP = this,
            js = dotPHP.transpiler.transpile(phpCode, filePath, Mode.asynchronous());

        return dotPHP.jsBeautify(js, {indent_size: 2});
    }
});

module.exports = DotPHP;
