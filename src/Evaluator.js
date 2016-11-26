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
    path = require('path');

/**
 * @param {Transpiler} transpiler
 * @param {IO} io
 * @param {FileSystemFactory} fileSystemFactory
 * @param {IncluderFactory} includerFactory
 * @param {Performance} performance
 * @constructor
 */
function Evaluator(transpiler, io, fileSystemFactory, includerFactory, performance) {
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
     * @type {Transpiler}
     */
    this.transpiler = transpiler;
}

_.extend(Evaluator.prototype, {
    /**
     * Executes and returns the result of the specified PHP file
     *
     * @param {string} phpCode PHP file's source code as a string
     * @param {string} filePath Absolute path to the file being evaluated
     * @return {Promise|Value}
     */
    evaluate: function (phpCode, filePath) {
        var evaluator = this,
            directoryPath = path.dirname(filePath),
            fileName = path.basename(filePath),
            fileSystem = evaluator.fileSystemFactory.create(directoryPath),
            compiledModule = evaluator.transpiler.transpile(phpCode, fileName),
            phpEngine = compiledModule({
                fileSystem: fileSystem,
                include: evaluator.includerFactory.create(fileSystem),
                performance: evaluator.performance
            }),
            resultValue;

        evaluator.io.install(phpEngine);

        resultValue = phpEngine.execute();

        return resultValue;
    }
});

module.exports = Evaluator;
