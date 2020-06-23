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
    Requirer = require('../../src/Requirer');

describe('Bootstrapper', function () {
    var bootstrapper,
        requirer;

    beforeEach(function () {
        requirer = sinon.createStubInstance(Requirer);

        bootstrapper = new Bootstrapper(requirer, [
            '/path/to/first_bootstrap.php',
            '/path/to/second_bootstrap.php'
        ]);
    });

    describe('bootstrap()', function () {
        var log;

        beforeEach(function () {
            log = [];

            requirer.require
                .withArgs('/path/to/first_bootstrap.php')
                .callsFake(function () {
                    log.push('first bootstrap require');

                    return Promise.resolve().then(function () {
                        log.push('first bootstrap done');
                    });
                });
            requirer.require
                .withArgs('/path/to/second_bootstrap.php')
                .callsFake(function () {
                    log.push('second bootstrap require');

                    return Promise.resolve().then(function () {
                        log.push('second bootstrap done');
                    });
                });
        });

        it('should call all bootstraps asynchronously in sequence', function () {
            return bootstrapper.bootstrap().then(function () {
                expect(log).to.deep.equal([
                    'first bootstrap require',
                    'first bootstrap done', // Ensure first bootstrap finishes before the second is started

                    'second bootstrap require',
                    'second bootstrap done'
                ]);
            });
        });

        it('should call all bootstraps in async mode', function () {
            return bootstrapper.bootstrap().then(function () {
                expect(requirer.require).to.have.always.been.calledWith(
                    sinon.match.any,
                    sinon.match(function (mode) {
                        return mode.isSynchronous() === false;
                    })
                );
            });
        });

        it('should work when no bootstraps are specified', function () {
            bootstrapper = new Bootstrapper(requirer, []);

            return expect(bootstrapper.bootstrap()).to.eventually.be.fulfilled;
        });
    });

    describe('bootstrapSync()', function () {
        it('should call all bootstraps synchronously in sequence', function () {
            var log = [];
            requirer.require.callsFake(function (path) {
                log.push('require: ' + path);
            });

            bootstrapper.bootstrapSync();

            expect(log).to.deep.equal([
                'require: /path/to/first_bootstrap.php',
                'require: /path/to/second_bootstrap.php'
            ]);
        });

        it('should call all bootstraps in sync mode', function () {
            bootstrapper.bootstrapSync();

            expect(requirer.require).to.have.always.been.calledWith(
                sinon.match.any,
                sinon.match(function (mode) {
                    return mode.isSynchronous();
                })
            );
        });
    });
});
