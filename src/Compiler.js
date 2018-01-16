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
 * @param {FileSystemFactory} fileSystemFactory
 * @param {IncluderFactory} includerFactory
 * @param {Performance} performance
 * @param {IO} io
 * @param {Function} require Node.js require(...) function to fetch the runtime via
 * @constructor
 */
function Compiler(transpiler, fileSystemFactory, includerFactory, performance, io, require) {
    /**
     * @type {FileSystemFactory}
     */
    this.fileSystemFactory = fileSystemFactory;
    /**
     * @type {IncluderFactory}
     */
    this.includerFactory = includerFactory;
    /**
     * @type {IO}
     */
    this.io = io;
    /**
     * @type {Performance}
     */
    this.performance = performance;
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
     * @param {string} transpiledCode
     * @param {string|null} filePath
     * @param {Mode} mode
     * @returns {Function}
     */
    compile: function (phpCode, filePath, mode) {
        /*jshint evil:true */
        var compiler = this,
            transpiledCode = compiler.transpiler.transpile(phpCode, filePath, mode),
            compiledModule = new Function('require', 'return ' + transpiledCode)(compiler.require),
            fileSystem = compiler.fileSystemFactory.create(),
            configuredCompiledModule = compiledModule.using({
                fileSystem: fileSystem,
                include: compiler.includerFactory.create(compiler, fileSystem, mode),
                path: filePath,
                performance: compiler.performance
            }),
            // Define a new module factory that will attach the standard IO to the environment if needed
            moduleFactory = function (options, environment, topLevelScope) {
                var phpEngine = configuredCompiledModule(options, environment, topLevelScope);

                compiler.io.install(phpEngine);

                return phpEngine;
            };

        return moduleFactory;
    }
});

module.exports = Compiler;
