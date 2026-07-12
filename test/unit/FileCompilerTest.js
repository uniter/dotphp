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
    PathMapper = require('../../src/PathMapper'),
    Stubber = require('../../src/Stubber');

describe('FileCompiler', function () {
    var compiler,
        fileCompiler,
        fs,
        pathMapper,
        stubber;

    beforeEach(function () {
        compiler = sinon.createStubInstance(Compiler);
        fs = {
            readFileSync: sinon.stub()
        };
        pathMapper = sinon.createStubInstance(PathMapper);
        stubber = sinon.createStubInstance(Stubber);

        stubber.getStub.returns(null);
        pathMapper.map.returnsArg(0);

        fileCompiler = new FileCompiler(fs, pathMapper, stubber, compiler);
    });

    describe('compile()', function () {
        it('should return a correctly compiled module factory when not stubbed', function () {
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
                .withArgs('<?php $my = "PHP code";', '/my/original/module_path.php')
                .returns(moduleFactory);

            expect(fileCompiler.compile('/my/original/module_path.php'))
                .to.equal(moduleFactory);
        });

        it('should not read from the filesystem when the mapped path is stubbed', function () {
            pathMapper.map
                .withArgs('/my/original/module_path.php')
                .returns('/my/mapped/module_path.php');
            stubber.getStub
                .withArgs('/my/mapped/module_path.php')
                .returns('<?php return null;');

            fileCompiler.compile('/my/original/module_path.php');

            expect(fs.readFileSync).not.to.have.been.called;
        });

        it('should apply path mapping before checking the stub', function () {
            pathMapper.map
                .withArgs('/my/original/module_path.php')
                .returns('/my/mapped/module_path.php');
            stubber.getStub
                .withArgs('/my/mapped/module_path.php')
                .returns('<?php return null;');

            fileCompiler.compile('/my/original/module_path.php');

            expect(pathMapper.map).to.have.been.calledWith('/my/original/module_path.php');
        });

        it('should compile the stub PHP code when the mapped path is stubbed', function () {
            var moduleFactory = sinon.stub();
            pathMapper.map
                .withArgs('/my/original/module_path.php')
                .returns('/my/mapped/module_path.php');
            stubber.getStub
                .withArgs('/my/mapped/module_path.php')
                .returns('<?php return 21;');
            compiler.compile
                .withArgs('<?php return 21;', '/my/original/module_path.php')
                .returns(moduleFactory);

            expect(fileCompiler.compile('/my/original/module_path.php')).to.equal(moduleFactory);
        });

        it('should use the original (pre-mapping) file path as the module path when compiling stubs', function () {
            pathMapper.map
                .withArgs('/my/original/module_path.php')
                .returns('/my/mapped/module_path.php');
            stubber.getStub
                .withArgs('/my/mapped/module_path.php')
                .returns('<?php return true;');
            compiler.compile.returns(sinon.stub());

            fileCompiler.compile('/my/original/module_path.php');

            expect(compiler.compile).to.have.been.calledWith(
                sinon.match.any,
                '/my/original/module_path.php'
            );
        });
    });
});
