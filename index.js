/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var DotPHP = require('./src/DotPHP'),
    Evaluator = require('./src/Evaluator'),
    FileSystem = require('./src/FileSystem'),
    FileSystemFactory = require('./src/FileSystemFactory'),
    IncluderFactory = require('./src/IncluderFactory'),
    IO = require('./src/IO'),
    Performance = require('./src/Performance'),
    RequireExtension = require('./src/RequireExtension'),
    Requirer = require('./src/Requirer'),
    Stream = require('./src/Stream'),
    StreamFactory = require('./src/StreamFactory'),
    Transpiler = require('./src/Transpiler'),
    fs = require('fs'),
    microtime = require('microtime'),
    phpToAST = require('phptoast'),
    phpToJS = require('phptojs'),
    transpiler = new Transpiler(
        phpToAST.create(null, {captureAllOffsets: true}),
        phpToJS,
        require
    ),
    streamFactory = new StreamFactory(Stream, fs),
    evaluator = new Evaluator(
        transpiler,
        new IO(process),
        new FileSystemFactory(FileSystem, fs, streamFactory),
        new IncluderFactory(fs, transpiler),
        new Performance(microtime)
    ),
    requirer = new Requirer(fs, evaluator),
    dotPHP = new DotPHP(
        new RequireExtension(requirer, require),
        requirer,
        evaluator
    );

module.exports = dotPHP;
