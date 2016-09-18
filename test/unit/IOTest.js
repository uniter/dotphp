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
    });
});
