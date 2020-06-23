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
    sinon = require('sinon'),
    Compiler = require('../../src/Compiler'),
    FileCompiler = require('../../src/FileCompiler'),
    Mode = require('../../src/Mode'),
    PathMapper = require('../../src/PathMapper');

describe('FileCompiler', function () {
    var compiler,
        fileCompiler,
        fs,
        pathMapper;

    beforeEach(function () {
        compiler = sinon.createStubInstance(Compiler);
        fs = {
            readFileSync: sinon.stub()
        };
        pathMapper = sinon.createStubInstance(PathMapper);

        fileCompiler = new FileCompiler(fs, pathMapper, compiler);
    });

    describe('compile()', function () {
        it('should return a correctly compiled module factory', function () {
            var moduleFactory = sinon.stub();
            pathMapper.map
                .withArgs('/my/original/module_path.php')
                .returns('/my/mapped/effective_module_path.php');
            fs.readFileSync
                .withArgs('/my/mapped/effective_module_path.php')
                .returns({
                    toString: sinon.stub().returns('<?php $my = "PHP code";')
                });
            compiler.compile
                .withArgs(
                    '<?php $my = "PHP code";',
                    '/my/original/module_path.php',
                    sinon.match(function (mode) {
                        return mode.isSynchronous();
                    })
                )
                .returns(moduleFactory);

            expect(fileCompiler.compile('/my/original/module_path.php', Mode.synchronous()))
                .to.equal(moduleFactory);
        });
    });
});
