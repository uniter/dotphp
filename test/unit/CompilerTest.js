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
    Environment = require('phpcore/src/Environment'),
    EnvironmentProvider = require('../../src/EnvironmentProvider'),
    FileSystem = require('../../src/FileSystem'),
    IncluderFactory = require('../../src/IncluderFactory'),
    Mode = require('../../src/Mode'),
    Transpiler = require('../../src/Transpiler');

describe('Compiler', function () {
    var compiledModule,
        compiler,
        environment,
        environmentProvider,
        extendedCompiledModule,
        fileSystem,
        includer,
        includerFactory,
        mode,
        phpEngine,
        phpRuntime,
        require,
        transpiler;

    beforeEach(function () {
        compiledModule = sinon.stub();
        environment = sinon.createStubInstance(Environment);
        environmentProvider = sinon.createStubInstance(EnvironmentProvider);
        extendedCompiledModule = sinon.stub();
        fileSystem = sinon.createStubInstance(FileSystem);
        includer = sinon.stub();
        includerFactory = sinon.createStubInstance(IncluderFactory);
        mode = sinon.createStubInstance(Mode);
        phpEngine = {
            execute: sinon.stub()
        };
        phpRuntime = {
            compile: sinon.stub().returns(compiledModule)
        };
        require = sinon.stub();
        transpiler = sinon.createStubInstance(Transpiler);

        environmentProvider.getEnvironmentForMode
            .withArgs(sinon.match.same(mode))
            .returns(environment);
        extendedCompiledModule.returns(phpEngine);
        compiledModule.using = sinon.stub().returns(extendedCompiledModule);
        includerFactory.create.returns(includer);
        require.withArgs('phpruntime').returns(phpRuntime);
        transpiler.transpile.returns('require("phpruntime").compile(function () {});');

        compiler = new Compiler(
            transpiler,
            includerFactory,
            require,
            environmentProvider,
            fileSystem
        );
    });

    describe('compile()', function () {
        it('should transpile the correct code', function () {
            compiler.compile('<?php print "my program";', '/my/awesome-module.php', mode);

            expect(transpiler.transpile).to.have.been.calledOnce;
            expect(transpiler.transpile).to.have.been.calledWith('<?php print "my program";');
        });

        it('should transpile the code with the correct file path', function () {
            compiler.compile('<?php print "my program";', '/my/awesome-module.php', mode);

            expect(transpiler.transpile).to.have.been.calledOnce;
            expect(transpiler.transpile).to.have.been.calledWith(sinon.match.any, '/my/awesome-module.php');
        });

        it('should pass the Compiler when creating the includer', function () {
            compiler.compile('<?php print "my program";', '/my/awesome-module.php', mode);

            expect(includerFactory.create).to.have.been.calledOnce;
            expect(includerFactory.create).to.have.been.calledWith(sinon.match.same(compiler));
        });

        it('should pass the created FileSystem when creating the includer', function () {
            compiler.compile('<?php print "my program";', '/my/awesome-module.php', mode);

            expect(includerFactory.create).to.have.been.calledOnce;
            expect(includerFactory.create).to.have.been.calledWith(
                sinon.match.any,
                sinon.match.same(fileSystem)
            );
        });

        it('should pass the Mode through when creating the includer', function () {
            compiler.compile('<?php print "my program";', '/my/awesome-module.php', mode);

            expect(includerFactory.create).to.have.been.calledOnce;
            expect(includerFactory.create).to.have.been.calledWith(
                sinon.match.any,
                sinon.match.any,
                sinon.match.same(mode)
            );
        });

        it('should extend the module factory with the created includer', function () {
            compiler.compile('<?php print "my program";', '/my/module.php', mode);

            expect(compiledModule.using).to.have.been.calledOnce;
            expect(compiledModule.using).to.have.been.calledWith(sinon.match({
                include: sinon.match.same(includer)
            }));
        });

        it('should extend the module factory with the file path', function () {
            compiler.compile('<?php print "my program";', '/my/module.php', mode);

            expect(compiledModule.using).to.have.been.calledOnce;
            expect(compiledModule.using).to.have.been.calledWith(sinon.match({
                path: '/my/module.php'
            }));
        });

        it('should specify the Environment for the module factory', function () {
            compiler.compile('<?php print "my program";', '/my/module.php', mode);

            expect(compiledModule.using).to.have.been.calledOnce;
            expect(compiledModule.using).to.have.been.calledWith(sinon.match.any, sinon.match.same(environment));
        });

        describe('when the returned module factory is called', function () {
            var moduleFactory;

            beforeEach(function () {
                moduleFactory = compiler.compile('<?php print "my program";', '/my/module.php', mode);
            });

            it('should pass options, environment and top-level scope through to the factory', function () {
                var environment = {},
                    options = {},
                    topLevelScope = {};

                moduleFactory(options, environment, topLevelScope);

                expect(extendedCompiledModule).to.have.been.calledOnce;
                expect(extendedCompiledModule).to.have.been.calledWith(
                    sinon.match.same(options),
                    sinon.match.same(environment),
                    sinon.match.same(topLevelScope)
                );
            });

            it('should return the compiled PHP module engine', function () {
                expect(moduleFactory()).to.equal(phpEngine);
            });
        });
    });
});
