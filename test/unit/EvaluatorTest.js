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
    Evaluator = require('../../src/Evaluator'),
    FileSystem = require('../../src/FileSystem'),
    FileSystemFactory = require('../../src/FileSystemFactory'),
    IncluderFactory = require('../../src/IncluderFactory'),
    IO = require('../../src/IO'),
    Performance = require('../../src/Performance'),
    Transpiler = require('../../src/Transpiler');

describe('Evaluator', function () {
    beforeEach(function () {
        this.compiledModule = sinon.stub();
        this.fileSystem = sinon.createStubInstance(FileSystem);
        this.fileSystemFactory = sinon.createStubInstance(FileSystemFactory);
        this.includer = sinon.stub();
        this.includerFactory = sinon.createStubInstance(IncluderFactory);
        this.io = sinon.createStubInstance(IO);
        this.performance = sinon.createStubInstance(Performance);
        this.phpEngine = {
            execute: sinon.stub()
        };
        this.transpiler = sinon.createStubInstance(Transpiler);

        this.compiledModule.returns(this.phpEngine);
        this.fileSystemFactory.create.returns(this.fileSystem);
        this.includerFactory.create.returns(this.includer);
        this.transpiler.transpile.returns(this.compiledModule);

        this.evaluator = new Evaluator(
            this.transpiler,
            this.io,
            this.fileSystemFactory,
            this.includerFactory,
            this.performance
        );
    });

    describe('require()', function () {
        it('should create the FileSystem with the correct directory path', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/path/to/module.php');

            expect(this.fileSystemFactory.create).to.have.been.calledOnce;
            expect(this.fileSystemFactory.create).to.have.been.calledWith('/my/path/to');
        });

        it('should transpile the correct code', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/awesome-module.php');

            expect(this.transpiler.transpile).to.have.been.calledOnce;
            expect(this.transpiler.transpile).to.have.been.calledWith('<?php print "my program";');
        });

        it('should transpile the code with the correct file name', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/awesome-module.php');

            expect(this.transpiler.transpile).to.have.been.calledOnce;
            expect(this.transpiler.transpile).to.have.been.calledWith(sinon.match.any, 'awesome-module.php');
        });

        it('should pass the created FileSystem when creating the includer', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/awesome-module.php');

            expect(this.includerFactory.create).to.have.been.calledOnce;
            expect(this.includerFactory.create).to.have.been.calledWith(sinon.match.same(this.fileSystem));
        });

        it('should compile the module with the created FileSystem', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/module.php');

            expect(this.compiledModule).to.have.been.calledOnce;
            expect(this.compiledModule).to.have.been.calledWith(sinon.match({
                fileSystem: sinon.match.same(this.fileSystem)
            }));
        });

        it('should compile the module with the created includer', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/module.php');

            expect(this.compiledModule).to.have.been.calledOnce;
            expect(this.compiledModule).to.have.been.calledWith(sinon.match({
                include: sinon.match.same(this.includer)
            }));
        });

        it('should compile the module with the Performance handler', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/module.php');

            expect(this.compiledModule).to.have.been.calledOnce;
            expect(this.compiledModule).to.have.been.calledWith(sinon.match({
                performance: sinon.match.same(this.performance)
            }));
        });

        it('should install the IO for the compiled PHP module', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/module.php');

            expect(this.io.install).to.have.been.calledOnce;
            expect(this.io.install).to.have.been.calledWith(sinon.match.same(this.phpEngine));
        });

        it('should return the result from executing the module', function () {
            this.phpEngine.execute.returns(21);

            expect(this.evaluator.evaluate('<?php print "my program";', '/my/module.php')).to.equal(21);
        });
    });
});
