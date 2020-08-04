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
 * @param {Parser} phpParser
 * @param {PHPToJS} phpToJS
 * @param {Object} transpilerConfig
 * @param {Object} phpToJSConfig
 * @constructor
 */
function Transpiler(phpParser, phpToJS, transpilerConfig, phpToJSConfig) {
    /**
     * @type {Parser}
     */
    this.phpParser = phpParser;
    /**
     * @type {PHPToJS}
     */
    this.phpToJS = phpToJS;
    /**
     * @type {Object}
     */
    this.phpToJSConfig = phpToJSConfig;
    /**
     * @type {Object}
     */
    this.transpilerConfig = transpilerConfig;
}

_.extend(Transpiler.prototype, {
    /**
     * Transpiles a PHP code string read from a file and returns its JavaScript equivalent
     *
     * @param {string} phpCode
     * @param {string} filePath
     * @param {Mode} mode
     * @returns {string}
     */
    transpile: function (phpCode, filePath, mode) {
        var phpAST,
            transpiler = this;

        // Tell the parser the path to the current file
        // so it can be included in error messages
        transpiler.phpParser.getState().setPath(filePath);

        phpAST = transpiler.phpParser.parse(phpCode);

        return transpiler.phpToJS.transpile(
            phpAST,
            _.extend(
                {
                    lineNumbers: true,
                    path: filePath,
                    sourceMap: {
                        sourceContent: phpCode
                    },
                    sync: mode.isSynchronous()
                },
                transpiler.phpToJSConfig
            ),
            // Any custom rules etc. will need to be specified here instead
            transpiler.transpilerConfig
        );
    }
});

module.exports = Transpiler;
