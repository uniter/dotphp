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
 * @param {Function} require Node.js require(...) function to fetch the runtime via
 * @constructor
 */
function Transpiler(phpParser, phpToJS, require) {
    /**
     * @type {Parser}
     */
    this.phpParser = phpParser;
    /**
     * @type {PHPToJS}
     */
    this.phpToJS = phpToJS;
    /**
     * @type {Function}
     */
    this.require = require;
}

_.extend(Transpiler.prototype, {
    /**
     * Transpiles a PHP code string read from a file and returns a module factory
     *
     * @param {string} phpCode
     * @param {string} filePath
     * @returns {Function}
     */
    transpile: function (phpCode, filePath) {
        var compiledModule,
            phpAST,
            transpiler = this,
            transpiledCode;

        // Tell the parser the path to the current file
        // so it can be included in error messages
        transpiler.phpParser.getState().setPath(filePath);

        phpAST = transpiler.phpParser.parse(phpCode);
        transpiledCode = transpiler.phpToJS.transpile(phpAST, {path: filePath, sync: true});
        /*jshint evil:true */
        compiledModule = new Function('require', 'return ' + transpiledCode)(transpiler.require);

        return compiledModule.using({
            path: filePath
        });
    }
});

module.exports = Transpiler;
