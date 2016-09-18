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
    FileSystem = require('../../src/FileSystem');

describe('FileSystem', function () {
    beforeEach(function () {
        this.stats = {
            isDirectory: sinon.stub().returns(false),
            isFile: sinon.stub().returns(false)
        };
        this.fs = {
            realpathSync: sinon.stub().returns('/a/real/path'),
            statSync: sinon.stub().returns(this.stats)
        };

        this.fileSystem = new FileSystem(this.fs, '/my/base/path');
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

        it('should resolve relative same-dir (dot)-prefixed paths relative to the base path', function () {
            this.fileSystem.realPath('./my/relative/path');

            expect(this.fs.realpathSync).to.have.been.calledOnce;
            expect(this.fs.realpathSync).to.have.been.calledWith('/my/base/path/my/relative/path');
        });

        it('should resolve relative parent-dir (2-dot)-prefixed paths relative to the parent of the base path', function () {
            this.fileSystem.realPath('../my/relative/path');

            expect(this.fs.realpathSync).to.have.been.calledOnce;
            expect(this.fs.realpathSync).to.have.been.calledWith('/my/base/my/relative/path');
        });
    });
});
