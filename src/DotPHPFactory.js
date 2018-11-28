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
    Compiler = require('./Compiler'),
    DotPHP = require('./DotPHP'),
    Evaluator = require('./Evaluator'),
    FileSystem = require('./FileSystem'),
    FileSystemFactory = require('./FileSystemFactory'),
    IncluderFactory = require('./IncluderFactory'),
    IO = require('./IO'),
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
 * @constructor
 */
function DotPHPFactory() {
}

_.extend(DotPHPFactory.prototype, {
    /**
     * Creates a new instance of the DotPHP library
     *
     * @param {fs} fs
     * @param {Process} process
     * @param {Function} require
     * @returns {DotPHP}
     */
    create: function (fs, process, require) {
        var transpiler = new Transpiler(
                phpToAST.create(null, {captureAllBounds: true}),
                phpToJS
            ),
            streamFactory = new StreamFactory(Stream, fs),
            compiler = new Compiler(
                transpiler,
                new FileSystemFactory(FileSystem, fs, streamFactory, process),
                new IncluderFactory(fs),
                new Performance(microtime),
                new IO(process),
                require
            ),
            evaluator = new Evaluator(compiler),
            requirer = new Requirer(fs, compiler),
            dotPHP = new DotPHP(
                new RequireExtension(requirer, require),
                requirer,
                evaluator,
                transpiler,
                jsBeautify.js_beautify,
                new StdinReader(process.stdin)
            );

        return dotPHP;
    }
});

module.exports = DotPHPFactory;
