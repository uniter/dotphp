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
    expect = require('chai').expect,
    sinon = require('sinon'),
    Compiler = require('../../src/Compiler'),
    ConfigSet = require('phpconfig/dist/ConfigSet').default,
    Environment = require('phpcore/src/Environment'),
    EnvironmentProvider = require('../../src/EnvironmentProvider'),
    FileSystem = require('../../src/FileSystem'),
    IncluderFactory = require('../../src/IncluderFactory'),
    IO = require('../../src/IO'),
    Performance = require('../../src/Performance'),
    Runtime = require('phpcore/src/Runtime').sync();

describe('EnvironmentProvider', function () {
    var asyncRuntime,
        builtinAddons,
        createProvider,
        fileSystem,
        includer,
        includerFactory,
        io,
        performance,
        phpCoreConfigSet,
        provider,
        psyncRuntime,
        syncRuntime;

    beforeEach(function () {
        asyncRuntime = sinon.createStubInstance(Runtime);
        builtinAddons = [];
        fileSystem = sinon.createStubInstance(FileSystem);
        includer = sinon.stub();
        includerFactory = sinon.createStubInstance(IncluderFactory);
        io = sinon.createStubInstance(IO);
        performance = sinon.createStubInstance(Performance);
        phpCoreConfigSet = sinon.createStubInstance(ConfigSet);
        psyncRuntime = sinon.createStubInstance(Runtime);
        syncRuntime = sinon.createStubInstance(Runtime);

        asyncRuntime.createEnvironment.callsFake(function () {
            return sinon.createStubInstance(Environment);
        });
        psyncRuntime.createEnvironment.callsFake(function () {
            return sinon.createStubInstance(Environment);
        });
        syncRuntime.createEnvironment.callsFake(function () {
            return sinon.createStubInstance(Environment);
        });

        createProvider = function (mode) {
            provider = new EnvironmentProvider(
                asyncRuntime,
                psyncRuntime,
                syncRuntime,
                io,
                includerFactory,
                fileSystem,
                performance,
                phpCoreConfigSet,
                mode,
                builtinAddons
            );
        };
        createProvider('async');
    });

    describe('getEnvironment()', function () {
        var compiler;

        beforeEach(function () {
            compiler = sinon.createStubInstance(Compiler);

            includerFactory.create
                .withArgs(sinon.match.same(compiler), sinon.match.same(fileSystem))
                .returns(includer);
        });

        it('should return the same Environment on subsequent calls', function () {
            var environment = provider.getEnvironment(compiler);

            expect(provider.getEnvironment(compiler)).to.equal(environment);
        });

        _.each(['async', 'psync', 'sync'], function (mode) {
            describe('for the "' + mode + '" mode', function () {
                var modeRuntime;

                beforeEach(function () {
                    modeRuntime = {
                        async: asyncRuntime,
                        psync: psyncRuntime,
                        sync: syncRuntime
                    }[mode];

                    createProvider(mode);
                });

                it('should create the Environment with the FileSystem and Performance services', function () {
                    provider.getEnvironment(compiler);

                    expect(modeRuntime.createEnvironment).to.have.been.calledOnce;
                    expect(modeRuntime.createEnvironment).to.have.been.calledWith(sinon.match({
                        fileSystem: sinon.match.same(fileSystem),
                        performance: sinon.match.same(performance)
                    }));
                });

                it('should create the Environment with the created includer', function () {
                    provider.getEnvironment(compiler);

                    expect(modeRuntime.createEnvironment).to.have.been.calledOnce;
                    expect(modeRuntime.createEnvironment).to.have.been.calledWith(sinon.match({
                        include: sinon.match.same(includer)
                    }));
                });

                it('should pass any options through from the config', function () {
                    phpCoreConfigSet.concatArrays
                        .withArgs('addons')
                        .returns([]);
                    phpCoreConfigSet.mergeAll
                        .returns({
                            myOption: 'my value'
                        });

                    provider.getEnvironment(compiler);

                    expect(modeRuntime.createEnvironment).to.have.been.calledOnce;
                    expect(modeRuntime.createEnvironment).to.have.been.calledWith(sinon.match({
                        myOption: 'my value'
                    }));
                });

                it('should remove any addons from the options config', function () {
                    phpCoreConfigSet.concatArrays
                        .withArgs('addons')
                        .returns([{'addon': 'one'}]);
                    phpCoreConfigSet.mergeAll
                        .returns({
                            addons: [{'addon': 'one'}],
                            myOption: 'my value'
                        });

                    provider.getEnvironment(compiler);

                    expect(modeRuntime.createEnvironment).to.have.been.calledOnce;
                    expect(modeRuntime.createEnvironment).to.have.been.calledWith(sinon.match(function (options) {
                        return !{}.hasOwnProperty.call(options, 'addons');
                    }));
                });

                it('should create the Environment with the builtin addons before provided ones', function () {
                    builtinAddons.push({'builtin addon': 'yes'});
                    phpCoreConfigSet.concatArrays
                        .withArgs('addons')
                        .returns([{'custom addon': 'one'}]);
                    phpCoreConfigSet.mergeAll
                        .returns({
                            addons: [{'custom addon': 'one'}],
                            myOption: 'my value'
                        });

                    provider.getEnvironment(compiler);

                    expect(modeRuntime.createEnvironment).to.have.been.calledOnce;
                    expect(modeRuntime.createEnvironment).to.have.been.calledWith(
                        sinon.match.any,
                        [{'builtin addon': 'yes'}, {'custom addon': 'one'}]
                    );
                });

                it('should create the Environment with any provided addons', function () {
                    phpCoreConfigSet.concatArrays
                        .withArgs('addons')
                        .returns([{'addon': 'one'}]);
                    phpCoreConfigSet.mergeAll
                        .returns({
                            addons: [{'addon': 'one'}],
                            myOption: 'my value'
                        });

                    provider.getEnvironment(compiler);

                    expect(modeRuntime.createEnvironment).to.have.been.calledOnce;
                    expect(modeRuntime.createEnvironment).to.have.been.calledWith(
                        sinon.match.any,
                        [{'addon': 'one'}]
                    );
                });

                it('should create the Environment with the combined addons from the PHPCore config set', function () {
                    phpCoreConfigSet.concatArrays
                        .withArgs('addons')
                        .returns([
                            {'my': 'first addon'},
                            {'my': 'second addon'}
                        ]);

                    provider.getEnvironment(compiler);

                    expect(modeRuntime.createEnvironment).to.have.been.calledOnce;
                    expect(modeRuntime.createEnvironment).to.have.been.calledWith(
                        sinon.match.any,
                        [
                            {'my': 'first addon'},
                            {'my': 'second addon'}
                        ]
                    );
                });
            });
        });

        it('should install the IO for the Environment on first call', function () {
            var environment = provider.getEnvironment(compiler);

            expect(io.install).to.have.been.calledOnce;
            expect(io.install).to.have.been.calledWith(sinon.match.same(environment));
        });

        it('should not attempt to reinstall the IO for the Environment on second call', function () {
            provider.getEnvironment(compiler);
            io.install.resetHistory();

            provider.getEnvironment(compiler); // Second call

            expect(io.install).not.to.have.been.called;
        });
    });
});
