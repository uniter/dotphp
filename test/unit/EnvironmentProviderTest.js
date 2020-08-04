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
    ConfigSet = require('phpconfig/dist/ConfigSet').default,
    Environment = require('phpcore/src/Environment'),
    EnvironmentProvider = require('../../src/EnvironmentProvider'),
    FileSystem = require('../../src/FileSystem'),
    IO = require('../../src/IO'),
    Mode = require('../../src/Mode'),
    Performance = require('../../src/Performance'),
    Runtime = require('phpcore/src/Runtime').sync();

describe('EnvironmentProvider', function () {
    var asyncRuntime,
        fileSystem,
        io,
        performance,
        phpCoreConfigSet,
        provider,
        syncRuntime;

    beforeEach(function () {
        asyncRuntime = sinon.createStubInstance(Runtime);
        fileSystem = sinon.createStubInstance(FileSystem);
        io = sinon.createStubInstance(IO);
        performance = sinon.createStubInstance(Performance);
        phpCoreConfigSet = sinon.createStubInstance(ConfigSet);
        syncRuntime = sinon.createStubInstance(Runtime);

        asyncRuntime.createEnvironment.callsFake(function () {
            return sinon.createStubInstance(Environment);
        });
        syncRuntime.createEnvironment.callsFake(function () {
            return sinon.createStubInstance(Environment);
        });

        provider = new EnvironmentProvider(
            asyncRuntime,
            syncRuntime,
            io,
            fileSystem,
            performance,
            phpCoreConfigSet
        );
    });

    describe('getAsyncEnvironment()', function () {
        it('should return the same Environment on subsequent calls', function () {
            var environment = provider.getAsyncEnvironment();

            expect(provider.getAsyncEnvironment()).to.equal(environment);
        });

        it('should create the Environment with the FileSystem and Performance services', function () {
            provider.getAsyncEnvironment();

            expect(asyncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(asyncRuntime.createEnvironment).to.have.been.calledWith({
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

            provider.getAsyncEnvironment();

            expect(asyncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(asyncRuntime.createEnvironment).to.have.been.calledWith(sinon.match({
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

            provider.getAsyncEnvironment();

            expect(asyncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(asyncRuntime.createEnvironment).to.have.been.calledWith(sinon.match(function (options) {
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

            provider.getAsyncEnvironment();

            expect(asyncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(asyncRuntime.createEnvironment).to.have.been.calledWith(
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

            provider.getAsyncEnvironment();

            expect(asyncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(asyncRuntime.createEnvironment).to.have.been.calledWith(
                sinon.match.any,
                [
                    {'my': 'first addon'},
                    {'my': 'second addon'}
                ]
            );
        });

        it('should install the IO for the Environment on first call', function () {
            var environment = provider.getAsyncEnvironment();

            expect(io.install).to.have.been.calledOnce;
            expect(io.install).to.have.been.calledWith(sinon.match.same(environment));
        });

        it('should not attempt to reinstall the IO for the Environment on second call', function () {
            provider.getAsyncEnvironment();
            io.install.resetHistory();

            provider.getAsyncEnvironment(); // Second call

            expect(io.install).not.to.have.been.called;
        });
    });

    describe('getEnvironmentForMode()', function () {
        describe('for asynchronous mode', function () {
            var mode;

            beforeEach(function () {
                mode = Mode.asynchronous();
            });

            it('should return the same Environment on subsequent calls', function () {
                var environment = provider.getEnvironmentForMode(mode);

                expect(provider.getEnvironmentForMode(mode)).to.equal(environment);
            });

            it('should create the Environment with the FileSystem and Performance services', function () {
                provider.getEnvironmentForMode(mode);

                expect(asyncRuntime.createEnvironment).to.have.been.calledOnce;
                expect(asyncRuntime.createEnvironment).to.have.been.calledWith({
                    fileSystem: sinon.match.same(fileSystem),
                    performance: sinon.match.same(performance)
                });
            });

            it('should create the Environment with the combined addons from the PHPCore config set', function () {
                phpCoreConfigSet.concatArrays
                    .withArgs('addons')
                    .returns([
                        {'my': 'first addon'},
                        {'my': 'second addon'}
                    ]);

                provider.getEnvironmentForMode(mode);

                expect(asyncRuntime.createEnvironment).to.have.been.calledOnce;
                expect(asyncRuntime.createEnvironment).to.have.been.calledWith(
                    sinon.match.any,
                    [
                        {'my': 'first addon'},
                        {'my': 'second addon'}
                    ]
                );
            });

            it('should install the IO for the Environment on first call', function () {
                var environment = provider.getEnvironmentForMode(mode);

                expect(io.install).to.have.been.calledOnce;
                expect(io.install).to.have.been.calledWith(sinon.match.same(environment));
            });

            it('should not attempt to reinstall the IO for the Environment on second call', function () {
                provider.getEnvironmentForMode(mode);
                io.install.resetHistory();

                provider.getEnvironmentForMode(mode); // Second call

                expect(io.install).not.to.have.been.called;
            });
        });

        describe('for synchronous mode', function () {
            var mode;

            beforeEach(function () {
                mode = Mode.synchronous();
            });

            it('should return the same Environment on subsequent calls', function () {
                var environment = provider.getEnvironmentForMode(mode);

                expect(provider.getEnvironmentForMode(mode)).to.equal(environment);
            });

            it('should create the Environment with the FileSystem and Performance services', function () {
                provider.getEnvironmentForMode(mode);

                expect(syncRuntime.createEnvironment).to.have.been.calledOnce;
                expect(syncRuntime.createEnvironment).to.have.been.calledWith({
                    fileSystem: sinon.match.same(fileSystem),
                    performance: sinon.match.same(performance)
                });
            });

            it('should create the Environment with the combined addons from the PHPCore config set', function () {
                phpCoreConfigSet.concatArrays
                    .withArgs('addons')
                    .returns([
                        {'my': 'first addon'},
                        {'my': 'second addon'}
                    ]);

                provider.getEnvironmentForMode(mode);

                expect(syncRuntime.createEnvironment).to.have.been.calledOnce;
                expect(syncRuntime.createEnvironment).to.have.been.calledWith(
                    sinon.match.any,
                    [
                        {'my': 'first addon'},
                        {'my': 'second addon'}
                    ]
                );
            });

            it('should install the IO for the Environment on first call', function () {
                var environment = provider.getEnvironmentForMode(mode);

                expect(io.install).to.have.been.calledOnce;
                expect(io.install).to.have.been.calledWith(sinon.match.same(environment));
            });

            it('should not attempt to reinstall the IO for the Environment on second call', function () {
                provider.getEnvironmentForMode(mode);
                io.install.resetHistory();

                provider.getEnvironmentForMode(mode); // Second call

                expect(io.install).not.to.have.been.called;
            });
        });
    });

    describe('getSyncEnvironment()', function () {
        it('should return the same Environment on subsequent calls', function () {
            var environment = provider.getSyncEnvironment();

            expect(provider.getSyncEnvironment()).to.equal(environment);
        });

        it('should create the Environment with the FileSystem and Performance services', function () {
            provider.getSyncEnvironment();

            expect(syncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(syncRuntime.createEnvironment).to.have.been.calledWith({
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

            provider.getSyncEnvironment();

            expect(syncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(syncRuntime.createEnvironment).to.have.been.calledWith(sinon.match({
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

            provider.getSyncEnvironment();

            expect(syncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(syncRuntime.createEnvironment).to.have.been.calledWith(sinon.match(function (options) {
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

            provider.getSyncEnvironment();

            expect(syncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(syncRuntime.createEnvironment).to.have.been.calledWith(
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

            provider.getSyncEnvironment();

            expect(syncRuntime.createEnvironment).to.have.been.calledOnce;
            expect(syncRuntime.createEnvironment).to.have.been.calledWith(
                sinon.match.any,
                [
                    {'my': 'first addon'},
                    {'my': 'second addon'}
                ]
            );
        });

        it('should install the IO for the Environment on first call', function () {
            var environment = provider.getSyncEnvironment();

            expect(io.install).to.have.been.calledOnce;
            expect(io.install).to.have.been.calledWith(sinon.match.same(environment));
        });

        it('should not attempt to reinstall the IO for the Environment on second call', function () {
            provider.getSyncEnvironment();
            io.install.resetHistory();

            provider.getSyncEnvironment(); // Second call

            expect(io.install).not.to.have.been.called;
        });
    });
});
