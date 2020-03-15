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
    Stream = require('../../src/Stream');

describe('Stream', function () {
    beforeEach(function () {
        this.fs = {
            close: sinon.stub(),
            closeSync: sinon.stub(),
            write: sinon.stub(),
            writeSync: sinon.stub()
        };

        this.stream = new Stream(this.fs, '/my/file/path.ext', 2120);
    });

    describe('close()', function () {
        it('should be resolved on success', function () {
            this.fs.close.withArgs(2120).yields(null);

            return expect(this.stream.close()).to.eventually.be.fulfilled;
        });

        it('should be rejected with the error from the fs module on failure', function () {
            var error = new Error('The file descriptor cannot be closed');
            this.fs.close.withArgs(2120).yields(error);

            return expect(this.stream.close()).to.eventually.be.rejectedWith(error);
        });

        describe('when the stream has already been closed', function () {
            beforeEach(function () {
                // Fd close should succeed
                this.fs.close.withArgs(2120).yields(null);

                // Wait for the first close to complete
                return this.stream.close();
            });

            it('should be rejected', function () {
                return expect(this.stream.close()).to.eventually.be.rejectedWith('Stream has already been closed');
            });

            it('should not attempt to write to the file descriptor', function () {
                return this.stream.close().then(function () {}, function () {
                    expect(this.fs.write).not.to.have.been.called;
                }.bind(this));
            });
        });
    });

    describe('closeSync()', function () {
        it('should close the file descriptor', function () {
            this.stream.closeSync();

            expect(this.fs.closeSync).to.have.been.calledOnce;
            expect(this.fs.closeSync).to.have.been.calledWith(2120);
        });

        describe('when the stream has already been closed', function () {
            it('should throw an error', function () {
                this.stream.closeSync();

                expect(function () {
                    this.stream.closeSync();
                }.bind(this)).to.throw('Stream has already been closed');
            });

            it('should not attempt to close the file descriptor again', function () {
                this.stream.closeSync();
                this.fs.closeSync.reset(); // Clear recorded calls to .closeSync() so we can check

                try {
                    this.stream.closeSync();
                } catch (e) {}

                expect(this.fs.closeSync).not.to.have.been.called;
            });
        });
    });

    describe('write()', function () {
        it('should be resolved on success', function () {
            this.fs.write.withArgs(2120, 'my data', 0, 7).yields(null, 7);

            return expect(this.stream.write('my data')).to.eventually.be.fulfilled;
        });

        it('should be rejected with the error from the fs module on failure', function () {
            var error = new Error('The file descriptor cannot be closed');
            this.fs.write.withArgs(2120, 'my data', 0, 7).yields(error);

            return expect(this.stream.write('my data')).to.eventually.be.rejectedWith(error);
        });

        describe('when the stream has already been written to', function () {
            beforeEach(function () {
                // Fd write should succeed
                this.fs.write.withArgs(2120, 'my intro', 0, 8).yields(null, 8);

                return this.stream.write('my intro');
            });

            it('should write the next string after the first', function () {
                this.fs.write.reset(); // Clear recorded calls to .write() so we can check
                // Fd write should succeed
                this.fs.write.yields(null, 9);

                return this.stream.write('then more').then(function () {
                    expect(this.fs.write).to.have.been.calledOnce;
                    expect(this.fs.write).to.have.been.calledWith(2120, 'then more', 8, 9);
                }.bind(this));
            });
        });

        describe('when the stream has been closed', function () {
            beforeEach(function () {
                // Fd close should succeed
                this.fs.close.withArgs(2120).yields(null);

                // Wait for the close to complete
                return this.stream.close();
            });

            it('should be rejected', function () {
                return expect(this.stream.write('my data')).to.eventually.be.rejectedWith('Stream has been closed');
            });

            it('should not attempt to write to the file descriptor', function () {
                return this.stream.write('my data').then(function () {}, function () {
                    expect(this.fs.write).not.to.have.been.called;
                }.bind(this));
            });
        });
    });

    describe('writeSync()', function () {
        it('should write to the file descriptor', function () {
            this.stream.writeSync('my data');

            expect(this.fs.writeSync).to.have.been.calledOnce;
            expect(this.fs.writeSync).to.have.been.calledWith(2120, 'my data', 0, 7);
        });

        describe('when the stream has already been written to', function () {
            beforeEach(function () {
                this.fs.writeSync.returns(8); // Should return the number of bytes written on success

                this.stream.writeSync('my intro');
            });

            it('should write the next string after the first', function () {
                this.fs.writeSync.reset(); // Clear recorded calls to .writeSync() so we can check

                this.stream.writeSync('then more');

                expect(this.fs.writeSync).to.have.been.calledOnce;
                expect(this.fs.writeSync).to.have.been.calledWith(2120, 'then more', 8, 9);
            });
        });

        describe('when the file descriptor has been closed', function () {
            it('should throw an error', function () {
                this.stream.closeSync();

                expect(function () {
                    this.stream.writeSync('some data');
                }.bind(this)).to.throw('Stream has been closed');
            });

            it('should not attempt to write to the file descriptor', function () {
                this.stream.closeSync();

                try {
                    this.stream.writeSync('some data');
                } catch (e) {}

                expect(this.fs.writeSync).not.to.have.been.called;
            });
        });
    });
});
