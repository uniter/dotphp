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
 * @param {RequireExtension} requireExtension
 * @param {FileCompiler} fileCompiler
 * @param {Bootstrapper} bootstrapper
 * @param {Evaluator} evaluator
 * @param {Transpiler} transpiler
 * @param {Function} jsBeautify Beautify NPM package
 * @param {StdinReader} stdinReader
 * @param {string} mode
 * @constructor
 */
function DotPHP(
    requireExtension,
    fileCompiler,
    bootstrapper,
    evaluator,
    transpiler,
    jsBeautify,
    stdinReader,
    mode
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
     * @type {string}
     */
    this.mode = mode;
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
     * @returns {Promise} Rejects if requiring any of the configured bootstrap files results in an error
     */
    bootstrap: function () {
        return this.bootstrapper.bootstrap();
    },

    /**
     * Executes and returns the result of the specified PHP code using the current synchronicity mode
     * (as set by unified platform config)
     *
     * @param {string} phpCode
     * @param {string|null} filePath
     * @returns {Promise<Value>|Value}
     */
    evaluate: function (phpCode, filePath) {
        return this.evaluator.evaluate(phpCode, filePath);
    },

    /**
     * Fetches the synchronicity mode for this DotPHP engine
     *
     * @returns {string}
     */
    getMode: function () {
        return this.mode;
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
     * @returns {Promise|null}
     */
    register: function () {
        return this.requireExtension.install();
    },

    /**
     * Fetches a PHP module factory from its full/real path using the current synchronicity mode
     * (as set by unified platform config)
     *
     * @param {string} filePath
     * @returns {Function}
     */
    require: function (filePath) {
        return this.fileCompiler.compile(filePath);
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
            js = dotPHP.transpiler.transpile(phpCode, filePath);

        return dotPHP.jsBeautify(js, {indent_size: 2});
    }
});

module.exports = DotPHP;
