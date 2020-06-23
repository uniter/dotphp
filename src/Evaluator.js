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
    phpCommon = require('phpcommon'),
    PHPError = phpCommon.PHPError,
    Promise = require('lie');

/**
 * @param {Compiler} compiler
 * @param {EnvironmentProvider} environmentProvider
 * @constructor
 */
function Evaluator(compiler, environmentProvider) {
    /**
     * @type {Compiler}
     */
    this.compiler = compiler;
    /**
     * @type {EnvironmentProvider}
     */
    this.environmentProvider = environmentProvider;
}

_.extend(Evaluator.prototype, {
    /**
     * Executes and returns the result of the specified PHP file
     *
     * @param {string} phpCode PHP file's source code as a string
     * @param {string|null} filePath Absolute path to the file being evaluated
     * @param {Mode} mode
     * @returns {Promise|Value}
     */
    evaluate: function (phpCode, filePath, mode) {
        var evaluator = this,
            environment = evaluator.environmentProvider.getEnvironmentForMode(mode),
            compiledModule,
            phpEngine,
            resultValueOrPromise;

        try {
            try {
                compiledModule = evaluator.compiler.compile(phpCode, filePath, mode);
            } catch (parseTranspileError) {
                if (parseTranspileError instanceof PHPError) {
                    // Report parser or transpiler errors via PHPCore,
                    // so that INI settings such as `display_errors` are taken into account
                    environment.reportError(parseTranspileError);
                }

                throw parseTranspileError;
            }

            phpEngine = compiledModule();
            resultValueOrPromise = phpEngine.execute();

            return resultValueOrPromise;
        } catch (error) {
            if (mode.isSynchronous()) {
                // Synchronous mode: allow the error to bubble up the call stack
                throw error;
            }

            // Asynchronous mode: for API consistency, still return a Promise but reject it
            return Promise.reject(error);
        }
    }
});

module.exports = Evaluator;
