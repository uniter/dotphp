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
    Environment = require('phpcore/src/Environment'),
    EventEmitter = require('events').EventEmitter,
    IO = require('../../src/IO');

describe('IO', function () {
    var dotPHPConfigSet,
        environment,
        io,
        phpStderr,
        phpStdout,
        process,
        stderr,
        stdout;

    beforeEach(function () {
        dotPHPConfigSet = {
            getBoolean: sinon.stub()
        };
        environment = sinon.createStubInstance(Environment);
        phpStderr = new EventEmitter();
        phpStdout = new EventEmitter();
        environment.getStderr.returns(phpStderr);
        environment.getStdout.returns(phpStdout);
        stderr = {
            write: sinon.stub()
        };
        stdout = {
            write: sinon.stub()
        };
        process = {
            stderr: stderr,
            stdout: stdout
        };

        dotPHPConfigSet.getBoolean
            .withArgs('stdio', true)
            .returns(true);

        io = new IO(dotPHPConfigSet, process);
    });

    describe('install()', function () {
        describe('when stdio is enabled', function () {
            it('should install a listener that copies data from the PHP stdout to process stdout', function () {
                io.install(environment);

                phpStdout.emit('data', 'some output');

                expect(process.stdout.write).to.have.been.calledOnce;
                expect(process.stdout.write).to.have.been.calledWith('some output');
                expect(process.stderr.write).not.to.have.been.called;
            });

            it('should install a listener that copies data from the PHP stderr to process stderr', function () {
                io.install(environment);

                phpStderr.emit('data', 'Bang! Something went wrong');

                expect(process.stderr.write).to.have.been.calledOnce;
                expect(process.stderr.write).to.have.been.calledWith('Bang! Something went wrong');
                expect(process.stdout.write).not.to.have.been.called;
            });

            it('should install a stdout listener onto each different one provided', function () {
                var secondPhpStderr = new EventEmitter(),
                    secondPhpStdout = new EventEmitter(),
                    secondEnvironment = sinon.createStubInstance(Environment);
                secondEnvironment.getStdout.returns(secondPhpStdout);
                secondEnvironment.getStderr.returns(secondPhpStderr);
                io.install(environment);
                io.install(secondEnvironment);

                phpStdout.emit('data', 'first output');
                secondPhpStdout.emit('data', 'second output');

                expect(process.stdout.write).to.have.been.calledTwice;
                expect(process.stdout.write).to.have.been.calledWith('first output');
                expect(process.stdout.write).to.have.been.calledWith('second output');
                expect(process.stderr.write).not.to.have.been.called;
            });

            it('should install a stderr listener onto each different one provided', function () {
                var secondPhpStderr = new EventEmitter(),
                    secondPhpStdout = new EventEmitter(),
                    secondEnvironment = sinon.createStubInstance(Environment);
                secondEnvironment.getStdout.returns(secondPhpStdout);
                secondEnvironment.getStderr.returns(secondPhpStderr);
                io.install(environment);
                io.install(secondEnvironment);

                phpStderr.emit('data', 'first warning');
                secondPhpStderr.emit('data', 'second warning');

                expect(process.stderr.write).to.have.been.calledTwice;
                expect(process.stderr.write).to.have.been.calledWith('first warning');
                expect(process.stderr.write).to.have.been.calledWith('second warning');
                expect(process.stdout.write).not.to.have.been.called;
            });
        });

        describe('when stdio is disabled in config', function () {
            beforeEach(function () {
                dotPHPConfigSet.getBoolean
                    .withArgs('stdio', true)
                    .returns(false);
            });

            it('should not install a listener that copies data from the PHP stdout', function () {
                io.install(environment);

                phpStdout.emit('data', 'some output');

                expect(process.stdout.write).not.to.have.been.called;
                expect(process.stderr.write).not.to.have.been.called;
            });

            it('should not install a listener that copies data from the PHP stderr', function () {
                io.install(environment);

                phpStderr.emit('data', 'Bang! Something went wrong');

                expect(process.stdout.write).not.to.have.been.called;
                expect(process.stderr.write).not.to.have.been.called;
            });
        });
    });
});
