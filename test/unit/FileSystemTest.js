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
    FileSystem = require('../../src/FileSystem'),
    Stream = require('../../src/Stream'),
    StreamFactory = require('../../src/StreamFactory');

describe('FileSystem', function () {
    beforeEach(function () {
        this.stats = {
            isDirectory: sinon.stub().returns(false),
            isFile: sinon.stub().returns(false)
        };
        this.fs = {
            open: sinon.stub(),
            openSync: sinon.stub(),
            realpathSync: sinon.stub().returns('/a/real/path'),
            statSync: sinon.stub().returns(this.stats),
            unlink: sinon.stub(),
            unlinkSync: sinon.stub()
        };
        this.process = {
            cwd: sinon.stub().returns('/my/cwd/path')
        };
        this.streamFactory = sinon.createStubInstance(StreamFactory);

        this.fileSystem = new FileSystem(this.fs, this.streamFactory, this.process);
    });

    describe('isDirectory()', function () {
        it('should perform one stat for the real path of the specified path', function () {
            this.fs.realpathSync.withArgs('/my/path').returns('/my/resolved/real/path');

            this.fileSystem.isDirectory('/my/path');

            expect(this.fs.statSync).to.have.been.calledOnce;
            expect(this.fs.statSync).to.have.been.calledWith('/my/resolved/real/path');
        });

        it('should return true when the stat returns true', function () {
            this.stats.isDirectory.returns(true);

            expect(this.fileSystem.isDirectory('/my/path')).to.be.true;
        });

        it('should return false when the stat returns false', function () {
            this.stats.isDirectory.returns(false);

            expect(this.fileSystem.isDirectory('/my/path')).to.be.false;
        });

        it('should return false when the stat throws an error', function () {
            this.stats.isDirectory.throws(new Error('File not found'));

            expect(this.fileSystem.isDirectory('/my/path')).to.be.false;
        });
    });

    describe('isFile()', function () {
        it('should perform one stat for the real path of the specified path', function () {
            this.fs.realpathSync.withArgs('/my/path').returns('/my/resolved/real/path');

            this.fileSystem.isFile('/my/path');

            expect(this.fs.statSync).to.have.been.calledOnce;
            expect(this.fs.statSync).to.have.been.calledWith('/my/resolved/real/path');
        });

        it('should return true when the stat returns true', function () {
            this.stats.isFile.returns(true);

            expect(this.fileSystem.isFile('/my/path')).to.be.true;
        });

        it('should return false when the stat returns false', function () {
            this.stats.isFile.returns(false);

            expect(this.fileSystem.isFile('/my/path')).to.be.false;
        });

        it('should return false when the stat throws an error', function () {
            this.stats.isFile.throws(new Error('File not found'));

            expect(this.fileSystem.isFile('/my/path')).to.be.false;
        });
    });

    describe('open()', function () {
        beforeEach(function () {
            this.fs.realpathSync.withArgs('/my/path').returns('/my/resolved/real/path');
        });

        it('should be resolved with the created Stream on success', function () {
            var stream = sinon.createStubInstance(Stream);
            this.fs.open.withArgs('/my/resolved/real/path', 'w+').yields(null, 21);
            this.streamFactory.create.withArgs('/my/resolved/real/path', 21).returns(stream);

            return expect(this.fileSystem.open('/my/path')).to.eventually.equal(stream);
        });

        it('should be rejected with the error from the fs module on failure', function () {
            var error = new Error('That file cannot be accessed');
            this.fs.open.withArgs('/my/resolved/real/path', 'w+').yields(error);

            return expect(this.fileSystem.open('/my/path')).to.eventually.be.rejectedWith(error);
        });
    });

    describe('openSync()', function () {
        beforeEach(function () {
            this.fs.realpathSync.withArgs('/my/path').returns('/my/resolved/real/path');
        });

        it('should return the created Stream on success', function () {
            var stream = sinon.createStubInstance(Stream);
            this.fs.openSync.withArgs('/my/resolved/real/path', 'w+').returns(101);
            this.streamFactory.create.withArgs('/my/resolved/real/path', 101).returns(stream);

            expect(this.fileSystem.openSync('/my/path')).to.equal(stream);
        });
    });

    describe('realPath()', function () {
        it('should return the result from realpath', function () {
            this.fs.realpathSync.returns('/my/resolved/real/path');

            expect(this.fileSystem.realPath('/my/path')).to.equal('/my/resolved/real/path');
        });

        it('should resolve absolute slash-prefixed paths relative to the root path', function () {
            this.fileSystem.realPath('/my/absolute/path');

            expect(this.fs.realpathSync).to.have.been.calledOnce;
            expect(this.fs.realpathSync).to.have.been.calledWith('/my/absolute/path');
        });

        it('should resolve relative same-dir (dot)-prefixed paths relative to the cwd path', function () {
            this.fileSystem.realPath('./my/relative/path');

            expect(this.fs.realpathSync).to.have.been.calledOnce;
            expect(this.fs.realpathSync).to.have.been.calledWith('/my/cwd/path/my/relative/path');
        });

        it('should resolve relative parent-dir (2-dot)-prefixed paths relative to the parent of the cwd path', function () {
            this.fileSystem.realPath('../my/relative/path');

            expect(this.fs.realpathSync).to.have.been.calledOnce;
            expect(this.fs.realpathSync).to.have.been.calledWith('/my/cwd/my/relative/path');
        });
    });

    describe('unlink()', function () {
        beforeEach(function () {
            this.fs.realpathSync.withArgs('/my/path').returns('/my/resolved/real/path');
        });

        it('should be resolved on success', function () {
            this.fs.unlink.withArgs('/my/resolved/real/path').yields(null);

            return expect(this.fileSystem.unlink('/my/path')).to.eventually.be.fulfilled;
        });

        it('should be rejected with the error from the fs module on failure', function () {
            var error = new Error('That file cannot be accessed');
            this.fs.unlink.withArgs('/my/resolved/real/path').yields(error);

            return expect(this.fileSystem.unlink('/my/path')).to.eventually.be.rejectedWith(error);
        });
    });

    describe('unlinkSync()', function () {
        beforeEach(function () {
            this.fs.realpathSync.withArgs('/my/path').returns('/my/resolved/real/path');
        });

        it('should unlink the file', function () {
            this.fileSystem.unlinkSync('/my/path');

            expect(this.fs.unlinkSync).to.have.been.calledOnce;
            expect(this.fs.unlinkSync).to.have.been.calledWith('/my/resolved/real/path');
        });
    });
});
