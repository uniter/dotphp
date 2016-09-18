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
    FileSystem = require('./src/FileSystem'),
    FileSystemFactory = require('./src/FileSystemFactory'),
    IncluderFactory = require('./src/IncluderFactory'),
    IO = require('./src/IO'),
    RequireExtension = require('./src/RequireExtension'),
    Requirer = require('./src/Requirer'),
    Transpiler = require('./src/Transpiler'),
    fs = require('fs'),
    phpToAST = require('phptoast'),
    phpToJS = require('phptojs'),
    transpiler = new Transpiler(
        phpToAST.create(),
        phpToJS,
        require
    ),
    requirer = new Requirer(
        fs,
        transpiler,
        new IO(process),
        new FileSystemFactory(FileSystem, fs),
        new IncluderFactory(fs, transpiler)
    ),
    dotPHP = new DotPHP(
        new RequireExtension(requirer, require),
        requirer
    );

module.exports = dotPHP;
