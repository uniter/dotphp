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
 * @param {Transpiler} transpiler
 * @param {IncluderFactory} includerFactory
 * @param {Function} require Node.js require(...) function to fetch the runtime via
 * @param {EnvironmentProvider} environmentProvider
 * @param {FileSystem} fileSystem
 * @constructor
 */
function Compiler(
    transpiler,
    includerFactory,
    require,
    environmentProvider,
    fileSystem
) {
    /**
     * @type {EnvironmentProvider}
     */
    this.environmentProvider = environmentProvider;
    /**
     * @type {FileSystem}
     */
    this.fileSystem = fileSystem;
    /**
     * @type {IncluderFactory}
     */
    this.includerFactory = includerFactory;
    /**
     * @type {Function}
     */
    this.require = require;
    /**
     * @type {Transpiler}
     */
    this.transpiler = transpiler;
}

_.extend(Compiler.prototype, {
    /**
     * Compiles a PHP code string read from a file and returns a module factory
     *
     * @param {string} phpCode
     * @param {string|null} filePath
     * @returns {Function}
     */
    compile: function (phpCode, filePath) {
        /*jshint evil:true */
        var compiler = this,
            transpiledCode = compiler.transpiler.transpile(phpCode, filePath),
            compiledModule = new Function('require', 'return ' + transpiledCode)(compiler.require),
            environment = compiler.environmentProvider.getEnvironment(),
            configuredCompiledModule = compiledModule.using({
                include: compiler.includerFactory.create(compiler, compiler.fileSystem),
                path: filePath
            }, environment);

        return configuredCompiledModule;
    }
});

module.exports = Compiler;
