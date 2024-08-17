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
    Bootstrapper = require('../../src/Bootstrapper'),
    Requirer = require('../../src/Requirer'),
    Value = require('phpcore/src/Value').sync();

describe('Bootstrapper', function () {
    var bootstrapper,
        createBootstrapper,
        requirer;

    beforeEach(function () {
        requirer = sinon.createStubInstance(Requirer);

        createBootstrapper = function (bootstraps, mode) {
            bootstrapper = new Bootstrapper(
                requirer,
                bootstraps || [
                    '/path/to/first_bootstrap.php',
                    '/path/to/second_bootstrap.php'
                ],
                mode || 'async'
            );
        };
        createBootstrapper();
    });

    describe('bootstrap()', function () {
        var firstBootstrapResultValue,
            secondBootstrapResultValue;

        beforeEach(function () {
            firstBootstrapResultValue = sinon.createStubInstance(Value);
            firstBootstrapResultValue.getType.returns('null');
            secondBootstrapResultValue = sinon.createStubInstance(Value);
            secondBootstrapResultValue.getType.returns('null');
        });

        describe('in async mode', function () {
            var log;

            beforeEach(function () {
                log = [];

                requirer.require
                    .withArgs('/path/to/first_bootstrap.php')
                    .callsFake(function () {
                        log.push('first bootstrap require');

                        return Promise.resolve().then(function () {
                            log.push('first bootstrap done');

                            return firstBootstrapResultValue;
                        });
                    });
                requirer.require
                    .withArgs('/path/to/second_bootstrap.php')
                    .callsFake(function () {
                        log.push('second bootstrap require');

                        return Promise.resolve().then(function () {
                            log.push('second bootstrap done');

                            return secondBootstrapResultValue;
                        });
                    });

                createBootstrapper(null, 'async');
            });

            it('should call all bootstraps asynchronously in sequence', async function () {
                await bootstrapper.bootstrap();

                expect(log).to.deep.equal([
                    'first bootstrap require',
                    'first bootstrap done', // Ensure first bootstrap finishes before the second is started

                    'second bootstrap require',
                    'second bootstrap done'
                ]);
            });

            it('should skip subsequent bootstraps when one has exited', async function () {
                firstBootstrapResultValue.getType.returns('exit');

                await bootstrapper.bootstrap();

                expect(log).to.deep.equal([
                    'first bootstrap require',
                    'first bootstrap done'
                ]);
            });

            it('should work when no bootstraps are specified', function () {
                createBootstrapper([], 'async');

                return expect(bootstrapper.bootstrap()).to.eventually.be.fulfilled;
            });
        });

        describe('in sync mode', function () {
            var log;

            beforeEach(function () {
                log = [];

                requirer.require
                    .withArgs('/path/to/first_bootstrap.php')
                    .callsFake(function () {
                        log.push('first bootstrap require');

                        return firstBootstrapResultValue;
                    });
                requirer.require
                    .withArgs('/path/to/second_bootstrap.php')
                    .callsFake(function () {
                        log.push('second bootstrap require');

                        return secondBootstrapResultValue;
                    });

                createBootstrapper(null, 'sync');
            });

            it('should call all bootstraps synchronously in sequence', function () {
                bootstrapper.bootstrap();

                expect(log).to.deep.equal([
                    'first bootstrap require',
                    'second bootstrap require'
                ]);
            });

            it('should skip subsequent bootstraps when one has exited', function () {
                firstBootstrapResultValue.getType.returns('exit');

                bootstrapper.bootstrap();

                expect(log).to.deep.equal([
                    'first bootstrap require'
                ]);
            });

            it('should work when no bootstraps are specified', function () {
                createBootstrapper([], 'sync');

                return expect(bootstrapper.bootstrap()).to.equal(null);
            });
        });
    });
});
