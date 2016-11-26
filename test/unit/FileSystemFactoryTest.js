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
    FileSystemFactory = require('../../src/FileSystemFactory'),
    StreamFactory = require('../../src/StreamFactory');

describe('FileSystemFactory', function () {
    beforeEach(function () {
        this.fs = {
            realpathSync: sinon.stub()
        };
        this.FileSystem = sinon.stub();
        this.streamFactory = sinon.createStubInstance(StreamFactory);

        this.factory = new FileSystemFactory(this.FileSystem, this.fs, this.streamFactory);
    });

    describe('create()', function () {
        it('should return an instance of FileSystem', function () {
            expect(this.factory.create('my/base/path')).to.be.an.instanceOf(this.FileSystem);
        });

        it('should create the FileSystem correctly', function () {
            this.fs.realpathSync.withArgs('my/base/path').returns('/absolutely/my/base/path');

            this.factory.create('my/base/path');

            expect(this.FileSystem).to.have.been.calledOnce;
            expect(this.FileSystem).to.have.been.calledWith(
                sinon.match.same(this.fs),
                sinon.match.same(this.streamFactory),
                '/absolutely/my/base/path'
            );
        });
    });
});
