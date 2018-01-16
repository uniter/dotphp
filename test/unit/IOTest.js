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
    EventEmitter = require('events').EventEmitter,
    IO = require('../../src/IO');

describe('IO', function () {
    beforeEach(function () {
        this.phpStderr = new EventEmitter();
        this.phpStdout = new EventEmitter();
        this.phpEngine = {
            getStderr: sinon.stub().returns(this.phpStderr),
            getStdout: sinon.stub().returns(this.phpStdout)
        };
        this.stderr = {
            write: sinon.stub()
        };
        this.stdout = {
            write: sinon.stub()
        };
        this.process = {
            stderr: this.stderr,
            stdout: this.stdout
        };

        this.io = new IO(this.process);
    });

    describe('install()', function () {
        it('should install a listener that copies data from the PHP stdout to process stdout', function () {
            this.io.install(this.phpEngine);

            this.phpStdout.emit('data', 'some output');

            expect(this.process.stdout.write).to.have.been.calledOnce;
            expect(this.process.stdout.write).to.have.been.calledWith('some output');
            expect(this.process.stderr.write).not.to.have.been.called;
        });

        it('should install a listener that copies data from the PHP stderr to process stderr', function () {
            this.io.install(this.phpEngine);

            this.phpStderr.emit('data', 'Bang! Something went wrong');

            expect(this.process.stderr.write).to.have.been.calledOnce;
            expect(this.process.stderr.write).to.have.been.calledWith('Bang! Something went wrong');
            expect(this.process.stdout.write).not.to.have.been.called;
        });

        it('should install a stdout listener onto each different one provided', function () {
            var secondPhpStderr = new EventEmitter(),
                secondPhpStdout = new EventEmitter(),
                secondPhpEngine = {
                    getStdout: sinon.stub().returns(secondPhpStdout),
                    getStderr: sinon.stub().returns(secondPhpStderr)
                };
            this.io.install(this.phpEngine);
            this.io.install(secondPhpEngine);

            this.phpStdout.emit('data', 'first output');
            secondPhpStdout.emit('data', 'second output');

            expect(this.process.stdout.write).to.have.been.calledTwice;
            expect(this.process.stdout.write).to.have.been.calledWith('first output');
            expect(this.process.stdout.write).to.have.been.calledWith('second output');
            expect(this.process.stderr.write).not.to.have.been.called;
        });

        it('should install a stderr listener onto each different one provided', function () {
            var secondPhpStderr = new EventEmitter(),
                secondPhpStdout = new EventEmitter(),
                secondPhpEngine = {
                    getStdout: sinon.stub().returns(secondPhpStdout),
                    getStderr: sinon.stub().returns(secondPhpStderr)
                };
            this.io.install(this.phpEngine);
            this.io.install(secondPhpEngine);

            this.phpStderr.emit('data', 'first warning');
            secondPhpStderr.emit('data', 'second warning');

            expect(this.process.stderr.write).to.have.been.calledTwice;
            expect(this.process.stderr.write).to.have.been.calledWith('first warning');
            expect(this.process.stderr.write).to.have.been.calledWith('second warning');
            expect(this.process.stdout.write).not.to.have.been.called;
        });

        it('should only install a stdout listener once per stream', function () {
            var secondPhpEngine = {
                    // Use the same stream objects to check the listeners are only registered once
                    getStdout: sinon.stub().returns(this.phpStdout),
                    getStderr: sinon.stub().returns(this.phpStderr)
                };
            this.io.install(this.phpEngine);
            this.io.install(secondPhpEngine);

            this.phpStdout.emit('data', 'the output');

            expect(this.process.stdout.write).to.have.been.calledOnce;
            expect(this.process.stdout.write).to.have.been.calledWith('the output');
            expect(this.process.stderr.write).not.to.have.been.called;
        });

        it('should only install a stderr listener once per stream', function () {
            var secondPhpEngine = {
                // Use the same stream objects to check the listeners are only registered once
                getStdout: sinon.stub().returns(this.phpStdout),
                getStderr: sinon.stub().returns(this.phpStderr)
            };
            this.io.install(this.phpEngine);
            this.io.install(secondPhpEngine);

            this.phpStderr.emit('data', 'the warning');

            expect(this.process.stderr.write).to.have.been.calledOnce;
            expect(this.process.stderr.write).to.have.been.calledWith('the warning');
            expect(this.process.stdout.write).not.to.have.been.called;
        });
    });
});
