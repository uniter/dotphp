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
    ConfigSet = require('phpconfig/dist/ConfigSet').default,
    Environment = require('phpcore/src/Environment'),
    EnvironmentProvider = require('../../src/EnvironmentProvider'),
    FileSystem = require('../../src/FileSystem'),
    IO = require('../../src/IO'),
    Performance = require('../../src/Performance'),
    Runtime = require('phpcore/src/Runtime').sync();

describe('EnvironmentProvider', function () {
    var asyncRuntime,
        createProvider,
        fileSystem,
        io,
        performance,
        phpCoreConfigSet,
        provider,
        psyncRuntime,
        syncRuntime;

    beforeEach(function () {
        asyncRuntime = sinon.createStubInstance(Runtime);
        fileSystem = sinon.createStubInstance(FileSystem);
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
                fileSystem,
                performance,
                phpCoreConfigSet,
                mode
            );
        };
        createProvider('async');
    });

    describe('getEnvironment()', function () {
        it('should return the same Environment on subsequent calls', function () {
            var environment = provider.getEnvironment();

            expect(provider.getEnvironment()).to.equal(environment);
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
                    provider.getEnvironment();

                    expect(modeRuntime.createEnvironment).to.have.been.calledOnce;
                    expect(modeRuntime.createEnvironment).to.have.been.calledWith({
                        fileSystem: sinon.match.same(fileSystem),
                        performance: sinon.match.same(performance)
                    });
                });

                it('should pass any options through from the config', function () {
                    phpCoreConfigSet.concatArrays
                        .withArgs('addons')
                        .returns([]);
                    phpCoreConfigSet.mergeAll
                        .returns({
                            myOption: 'my value'
                        });

                    provider.getEnvironment();

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

                    provider.getEnvironment();

                    expect(modeRuntime.createEnvironment).to.have.been.calledOnce;
                    expect(modeRuntime.createEnvironment).to.have.been.calledWith(sinon.match(function (options) {
                        return !{}.hasOwnProperty.call(options, 'addons');
                    }));
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

                    provider.getEnvironment();

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

                    provider.getEnvironment();

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
            var environment = provider.getEnvironment();

            expect(io.install).to.have.been.calledOnce;
            expect(io.install).to.have.been.calledWith(sinon.match.same(environment));
        });

        it('should not attempt to reinstall the IO for the Environment on second call', function () {
            provider.getEnvironment();
            io.install.resetHistory();

            provider.getEnvironment(); // Second call

            expect(io.install).not.to.have.been.called;
        });
    });
});
