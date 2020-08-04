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
    Bootstrapper = require('./Bootstrapper'),
    Compiler = require('./Compiler'),
    DotPHP = require('./DotPHP'),
    EnvironmentProvider = require('./EnvironmentProvider'),
    Evaluator = require('./Evaluator'),
    FileCompiler = require('./FileCompiler'),
    FileSystem = require('./FileSystem'),
    IncluderFactory = require('./IncluderFactory'),
    IO = require('./IO'),
    PathMapper = require('./PathMapper'),
    Performance = require('./Performance'),
    RequireExtension = require('./RequireExtension'),
    Requirer = require('./Requirer'),
    StdinReader = require('./StdinReader'),
    Stream = require('./Stream'),
    StreamFactory = require('./StreamFactory'),
    Transpiler = require('./Transpiler'),
    jsBeautify = require('js-beautify'),
    microtime = require('microtime'),
    phpToAST = require('phptoast'),
    phpToJS = require('phptojs');

/**
 * Constructs the object graph for an instance of the DotPHP library
 *
 * @param {fs} fs
 * @param {Process} process
 * @param {ConfigLoaderInterface} configLoader
 * @param {Runtime} asyncRuntime
 * @param {Runtime} syncRuntime
 * @param {Function} require
 * @constructor
 */
function DotPHPFactory(
    fs,
    process,
    configLoader,
    asyncRuntime,
    syncRuntime,
    require
) {
    /**
     * @type {Runtime}
     */
    this.asyncRuntime = asyncRuntime;
    /**
     * @type {ConfigLoaderInterface}
     */
    this.configLoader = configLoader;
    /**
     * @type {fs}
     */
    this.fs = fs;
    /**
     * @type {Process}
     */
    this.process = process;
    /**
     * @type {Function}
     */
    this.require = require;
    /**
     * @type {Runtime}
     */
    this.syncRuntime = syncRuntime;
}

_.extend(DotPHPFactory.prototype, {
    /**
     * Creates a new instance of the DotPHP library
     *
     * @param {string=} contextDirectory Directory to search for a Uniter unified config file
     * @returns {DotPHP}
     */
    create: function (contextDirectory) {
        var factory = this,
            uniterConfig = factory.configLoader.getConfig(
                contextDirectory ?
                    [contextDirectory, factory.process.cwd()] :
                    [factory.process.cwd()]
            ),
            dotPHPConfigSet = uniterConfig.getConfigsForLibrary('dotphp'),
            pathMapper = new PathMapper(dotPHPConfigSet.mergeObjects('map')),
            transpiler = new Transpiler(
                phpToAST.create(null, _.extend(
                    {captureAllBounds: true},
                    uniterConfig
                        .getConfigsForLibrary('dotphp', 'phptoast')
                        .mergeUniqueObjects()
                )),
                phpToJS,
                uniterConfig.getConfigsForLibrary('dotphp', 'transpiler')
                    .mergeUniqueObjects(),
                uniterConfig.getConfigsForLibrary('dotphp', 'phptojs')
                    .mergeUniqueObjects()
            ),
            streamFactory = new StreamFactory(Stream, factory.fs),
            fileSystem = new FileSystem(factory.fs, streamFactory, factory.process),
            io = new IO(dotPHPConfigSet, factory.process),
            performance = new Performance(microtime),
            environmentProvider = new EnvironmentProvider(
                factory.asyncRuntime,
                factory.syncRuntime,
                io,
                fileSystem,
                performance,
                uniterConfig.getConfigsForLibrary('dotphp', 'phpcore')
            ),
            compiler = new Compiler(
                transpiler,
                new IncluderFactory(factory.fs, pathMapper),
                factory.require,
                environmentProvider,
                fileSystem
            ),
            evaluator = new Evaluator(compiler, environmentProvider),
            fileCompiler = new FileCompiler(factory.fs, pathMapper, compiler),
            requirer = new Requirer(fileCompiler),
            bootstrapper = new Bootstrapper(requirer, dotPHPConfigSet.concatArrays('bootstraps')),
            dotPHP = new DotPHP(
                new RequireExtension(fileCompiler, bootstrapper, factory.require),
                fileCompiler,
                bootstrapper,
                evaluator,
                transpiler,
                jsBeautify.js_beautify,
                new StdinReader(factory.process.stdin)
            );

        return dotPHP;
    }
});

module.exports = DotPHPFactory;
