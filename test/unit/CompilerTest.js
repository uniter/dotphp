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
    FileSystem = require('../../src/FileSystem'),
    FileSystemFactory = require('../../src/FileSystemFactory'),
    IncluderFactory = require('../../src/IncluderFactory'),
    IO = require('../../src/IO'),
    Mode = require('../../src/Mode'),
    Performance = require('../../src/Performance'),
    Transpiler = require('../../src/Transpiler');

describe('Compiler', function () {
    beforeEach(function () {
        this.compiledModule = sinon.stub();
        this.extendedCompiledModule = sinon.stub();
        this.fileSystem = sinon.createStubInstance(FileSystem);
        this.fileSystemFactory = sinon.createStubInstance(FileSystemFactory);
        this.includer = sinon.stub();
        this.includerFactory = sinon.createStubInstance(IncluderFactory);
        this.io = sinon.createStubInstance(IO);
        this.mode = sinon.createStubInstance(Mode);
        this.performance = sinon.createStubInstance(Performance);
        this.phpEngine = {
            execute: sinon.stub()
        };
        this.phpRuntime = {
            compile: sinon.stub().returns(this.compiledModule)
        };
        this.require = sinon.stub();
        this.transpiler = sinon.createStubInstance(Transpiler);

        this.extendedCompiledModule.returns(this.phpEngine);
        this.compiledModule.using = sinon.stub().returns(this.extendedCompiledModule);
        this.fileSystemFactory.create.returns(this.fileSystem);
        this.includerFactory.create.returns(this.includer);
        this.require.withArgs('phpruntime').returns(this.phpRuntime);
        this.transpiler.transpile.returns('require("phpruntime").compile(function () {});');

        this.compiler = new Compiler(
            this.transpiler,
            this.fileSystemFactory,
            this.includerFactory,
            this.performance,
            this.io,
            this.require
        );
    });

    describe('compile()', function () {
        it('should transpile the correct code', function () {
            this.compiler.compile('<?php print "my program";', '/my/awesome-module.php', this.mode);

            expect(this.transpiler.transpile).to.have.been.calledOnce;
            expect(this.transpiler.transpile).to.have.been.calledWith('<?php print "my program";');
        });

        it('should transpile the code with the correct file path', function () {
            this.compiler.compile('<?php print "my program";', '/my/awesome-module.php', this.mode);

            expect(this.transpiler.transpile).to.have.been.calledOnce;
            expect(this.transpiler.transpile).to.have.been.calledWith(sinon.match.any, '/my/awesome-module.php');
        });

        it('should create the FileSystem with the correct directory path as cwd', function () {
            this.compiler.compile('<?php print "my program";', '/my/path/to/module.php', this.mode);

            expect(this.fileSystemFactory.create).to.have.been.calledOnce;
        });

        it('should pass the Compiler when creating the includer', function () {
            this.compiler.compile('<?php print "my program";', '/my/awesome-module.php', this.mode);

            expect(this.includerFactory.create).to.have.been.calledOnce;
            expect(this.includerFactory.create).to.have.been.calledWith(sinon.match.same(this.compiler));
        });

        it('should pass the created FileSystem when creating the includer', function () {
            this.compiler.compile('<?php print "my program";', '/my/awesome-module.php', this.mode);

            expect(this.includerFactory.create).to.have.been.calledOnce;
            expect(this.includerFactory.create).to.have.been.calledWith(
                sinon.match.any,
                sinon.match.same(this.fileSystem)
            );
        });

        it('should pass the Mode through when creating the includer', function () {
            this.compiler.compile('<?php print "my program";', '/my/awesome-module.php', this.mode);

            expect(this.includerFactory.create).to.have.been.calledOnce;
            expect(this.includerFactory.create).to.have.been.calledWith(
                sinon.match.any,
                sinon.match.any,
                sinon.match.same(this.mode)
            );
        });

        it('should extend the module factory with the created FileSystem', function () {
            this.compiler.compile('<?php print "my program";', '/my/module.php', this.mode);

            expect(this.compiledModule.using).to.have.been.calledOnce;
            expect(this.compiledModule.using).to.have.been.calledWith(sinon.match({
                fileSystem: sinon.match.same(this.fileSystem)
            }));
        });

        it('should extend the module factory with the created includer', function () {
            this.compiler.compile('<?php print "my program";', '/my/module.php', this.mode);

            expect(this.compiledModule.using).to.have.been.calledOnce;
            expect(this.compiledModule.using).to.have.been.calledWith(sinon.match({
                include: sinon.match.same(this.includer)
            }));
        });

        it('should extend the module factory with the file path', function () {
            this.compiler.compile('<?php print "my program";', '/my/module.php', this.mode);

            expect(this.compiledModule.using).to.have.been.calledOnce;
            expect(this.compiledModule.using).to.have.been.calledWith(sinon.match({
                path: '/my/module.php'
            }));
        });

        it('should extend the module factory with the Performance handler', function () {
            this.compiler.compile('<?php print "my program";', '/my/module.php', this.mode);

            expect(this.compiledModule.using).to.have.been.calledOnce;
            expect(this.compiledModule.using).to.have.been.calledWith(sinon.match({
                performance: sinon.match.same(this.performance)
            }));
        });

        describe('when the returned module factory is called', function () {
            beforeEach(function () {
                this.moduleFactory = this.compiler.compile('<?php print "my program";', '/my/module.php', this.mode);
            });

            it('should pass options, environment and top-level scope through to the factory', function () {
                var environment = {},
                    options = {},
                    topLevelScope = {};

                this.moduleFactory(options, environment, topLevelScope);

                expect(this.extendedCompiledModule).to.have.been.calledOnce;
                expect(this.extendedCompiledModule).to.have.been.calledWith(
                    sinon.match.same(options),
                    sinon.match.same(environment),
                    sinon.match.same(topLevelScope)
                );
            });

            it('should install the IO for the compiled PHP module', function () {
                this.moduleFactory();

                expect(this.io.install).to.have.been.calledOnce;
                expect(this.io.install).to.have.been.calledWith(sinon.match.same(this.phpEngine));
            });

            it('should return the compiled PHP module engine', function () {
                expect(this.moduleFactory()).to.equal(this.phpEngine);
            });
        });
    });
});
