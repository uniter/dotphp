/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var expect = require('chai').expect,
    microtime = require('microtime'),
    sinon = require('sinon'),
    DotPHP = require('../../src/DotPHP'),
    Evaluator = require('../../src/Evaluator'),
    FileSystem = require('../../src/FileSystem'),
    FileSystemFactory = require('../../src/FileSystemFactory'),
    IncluderFactory = require('../../src/IncluderFactory'),
    IO = require('../../src/IO'),
    Performance = require('../../src/Performance'),
    RequireExtension = require('../../src/RequireExtension'),
    Requirer = require('../../src/Requirer'),
    Transpiler = require('../../src/Transpiler'),
    phpRuntime = require('phpruntime/sync'),
    phpToAST = require('phptoast'),
    phpToJS = require('phptojs');

describe('Module require integration', function () {
    beforeEach(function () {
        this.fs = {
            readFileSync: sinon.stub(),
            realpathSync: sinon.stub().returnsArg(0)
        };

        this.module = {
            exports: {}
        };

        this.process = {
            stderr: {
                write: sinon.stub()
            },
            stdout: {
                write: sinon.stub()
            }
        };

        this.require = sinon.stub();
        this.require.extensions = {};
        this.require.withArgs('phpruntime/sync').returns(phpRuntime);

        this.transpiler = new Transpiler(
            phpToAST.create(null, {captureAllOffsets: true}),
            phpToJS,
            this.require
        );
        this.evaluator = new Evaluator(
            this.transpiler,
            new IO(this.process),
            new FileSystemFactory(FileSystem, this.fs),
            new IncluderFactory(this.fs, this.transpiler),
            new Performance(microtime)
        );
        this.requirer = new Requirer(
            this.fs,
            this.evaluator
        );

        this.dotPHP = new DotPHP(
            new RequireExtension(this.requirer, this.require),
            this.requirer,
            this.evaluator
        );
    });

    describe('after installing the require(...) extension', function () {
        beforeEach(function () {
            this.dotPHP.register();
        });

        it('should correctly require a PHP module that just returns 21', function () {
            this.fs.readFileSync
                .withArgs('/real/path/to/my/module.php')
                .returns({toString: sinon.stub().returns('<?php $myVar = 21; return $myVar;')});

            this.require.extensions['.php'](this.module, '/real/path/to/my/module.php');

            expect(this.module.exports.getNative()).to.equal(21);
        });

        it('should correctly require a PHP module that includes another', function () {
            this.fs.realpathSync.withArgs('/path/to/my/module.php').returns('/real/path/to/my/module.php');
            this.fs.readFileSync
                .withArgs('/real/path/to/my/module.php')
                .returns({toString: sinon.stub().returns('<?php $myVar = require "../another.php"; return $myVar + 21;')});
            this.fs.realpathSync.withArgs('/real/path/to/another.php').returns('/real/path/to/another.php');
            this.fs.readFileSync
                .withArgs('/real/path/to/another.php')
                .returns({toString: sinon.stub().returns('<?php $anotherVar = 1000; return $anotherVar;')});

            this.require.extensions['.php'](this.module, '/real/path/to/my/module.php');

            expect(this.module.exports.getNative()).to.equal(1021);
        });
    });

    describe('public .require(...) method', function () {
        it('should correctly require a PHP module that just returns 21', function () {
            this.fs.readFileSync
                .withArgs('/real/path/to/my/module.php')
                .returns({toString: sinon.stub().returns('<?php $myVar = 21; return $myVar;')});

            expect(this.dotPHP.require('/real/path/to/my/module.php').getNative()).to.equal(21);
        });

        it('should correctly require a PHP module that includes another', function () {
            this.fs.realpathSync.withArgs('/path/to/my/module.php').returns('/real/path/to/my/module.php');
            this.fs.readFileSync
                .withArgs('/real/path/to/my/module.php')
                .returns({toString: sinon.stub().returns('<?php $myVar = require "../another.php"; return $myVar + 21;')});
            this.fs.realpathSync.withArgs('/real/path/to/another.php').returns('/real/path/to/another.php');
            this.fs.readFileSync
                .withArgs('/real/path/to/another.php')
                .returns({toString: sinon.stub().returns('<?php $anotherVar = 1000; return $anotherVar;')});

            expect(this.dotPHP.require('/real/path/to/my/module.php').getNative()).to.equal(1021);
        });
    });
});
