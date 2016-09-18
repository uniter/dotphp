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
 * @param {fs} fs
 * @param {Transpiler} transpiler
 * @param {IO} io
 * @param {FileSystemFactory} fileSystemFactory
 * @param {IncluderFactory} includerFactory
 * @constructor
 */
function Requirer(fs, transpiler, io, fileSystemFactory, includerFactory) {
    /**
     * @type {FileSystemFactory}
     */
    this.fileSystemFactory = fileSystemFactory;
    /**
     * @type {fs}
     */
    this.fs = fs;
    /**
     * @type {IncluderFactory}
     */
    this.includerFactory = includerFactory;
    /**
     * @type {IO}
     */
    this.io = io;
    /**
     * @type {Transpiler}
     */
    this.transpiler = transpiler;
}

_.extend(Requirer.prototype, {
    /**
     * Requires, executes and returns the result of the specified PHP file
     *
     * @param {string} filePath
     * @return {Promise|Value}
     */
    require: function (filePath) {
        var requirer = this,
            directoryPath = path.dirname(filePath),
            fileSystem = requirer.fileSystemFactory.create(directoryPath),
            phpCode = requirer.fs.readFileSync(filePath).toString(),
            compiledModule = requirer.transpiler.transpile(phpCode, filePath),
            phpEngine = compiledModule({
                fileSystem: fileSystem,
                include: requirer.includerFactory.create(fileSystem)
            }),
            resultValue;

        requirer.io.install(phpEngine);

        resultValue = phpEngine.execute();

        return resultValue;
    }
});

module.exports = Requirer;
