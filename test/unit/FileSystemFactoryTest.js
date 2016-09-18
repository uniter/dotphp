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
    FileSystemFactory = require('../../src/FileSystemFactory');

describe('FileSystemFactory', function () {
    beforeEach(function () {
        this.fs = {};
        this.FileSystem = sinon.stub();

        this.factory = new FileSystemFactory(this.FileSystem, this.fs);
    });

    describe('create()', function () {
        it('should return an instance of FileSystem', function () {
            expect(this.factory.create('/my/base/path')).to.be.an.instanceOf(this.FileSystem);
        });

        it('should create the FileSystem correctly', function () {
            this.factory.create('/my/base/path');

            expect(this.FileSystem).to.have.been.calledOnce;
            expect(this.FileSystem).to.have.been.calledWith(sinon.match.same(this.fs), '/my/base/path');
        });
    });
});
