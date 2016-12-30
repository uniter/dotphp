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
 * @constructor
 */
function Transpiler(phpParser, phpToJS) {
    /**
     * @type {Parser}
     */
    this.phpParser = phpParser;
    /**
     * @type {PHPToJS}
     */
    this.phpToJS = phpToJS;
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
            {
                path: filePath,
                sourceMap: {
                    sourceContent: phpCode
                },
                sync: mode.isSynchronous()
            }
        );
    }
});

module.exports = Transpiler;
