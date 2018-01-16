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
 * @param {Compiler} compiler
 * @constructor
 */
function Evaluator(compiler) {
    /**
     * @type {Compiler}
     */
    this.compiler = compiler;
}

_.extend(Evaluator.prototype, {
    /**
     * Executes and returns the result of the specified PHP file
     *
     * @param {string} phpCode PHP file's source code as a string
     * @param {string|null} filePath Absolute path to the file being evaluated
     * @param {Mode} mode
     * @return {Promise|Value}
     */
    evaluate: function (phpCode, filePath, mode) {
        var evaluator = this,
            compiledModule = evaluator.compiler.compile(phpCode, filePath, mode),
            phpEngine = compiledModule(),
            resultValueOrPromise;

        resultValueOrPromise = phpEngine.execute();

        return resultValueOrPromise;
    }
});

module.exports = Evaluator;
