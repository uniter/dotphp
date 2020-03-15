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
    StreamFactory = require('../../src/StreamFactory');

describe('StreamFactory', function () {
    beforeEach(function () {
        this.fs = {};
        this.Stream = sinon.stub();

        this.streamFactory = new StreamFactory(this.Stream, this.fs);
    });

    describe('create()', function () {
        it('should create the Stream correctly', function () {
            this.streamFactory.create('/my/file/path.ext', 27);

            expect(this.Stream).to.have.been.calledOnce;
            expect(this.Stream).to.have.been.calledWith(
                sinon.match.same(this.fs),
                '/my/file/path.ext',
                27
            );
        });

        it('should return the created Stream', function () {
            var stream = new this.Stream();
            this.Stream.returns(stream);

            expect(this.streamFactory.create('/my/file/path.ext', 27)).to.equal(stream);
        });
    });
});
