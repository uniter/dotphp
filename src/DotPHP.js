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
 * @param {Requirer} requirer
 * @param {Evaluator} evaluator
 * @param {Transpiler} transpiler
 * @param {Function} jsBeautify Beautify NPM package
 * @param {StdinReader} stdinReader
 * @constructor
 */
function DotPHP(requireExtension, requirer, evaluator, transpiler, jsBeautify, stdinReader) {
    /**
     * @type {Evaluator}
     */
    this.evaluator = evaluator;
    /**
     * @type {Function}
     */
    this.jsBeautify = jsBeautify;
    /**
     * @type {RequireExtension}
     */
    this.requireExtension = requireExtension;
    /**
     * @type {Requirer}
     */
    this.requirer = requirer;
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
     */
    register: function (options) {
        this.requireExtension.install(options);
    },

    /**
     * Fetches a PHP module from its full/real path in asynchronous mode
     *
     * @param {string} filePath
     * @returns {Promise|Value}
     */
    require: function (filePath) {
        return this.requirer.require(filePath, Mode.asynchronous());
    },

    /**
     * Fetches a PHP module from its full/real path in synchronous mode
     *
     * @param {string} filePath
     * @returns {Promise|Value}
     */
    requireSync: function (filePath) {
        return this.requirer.require(filePath, Mode.synchronous());
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
