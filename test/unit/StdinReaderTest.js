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
    Promise = require('lie'),
    StdinReader = require('../../src/StdinReader'),
    Readable = require('stream').Readable;

describe('StdinReader', function () {
    var reader,
        stdin;

    beforeEach(function () {
        stdin = new Readable();
        stdin._read = sinon.stub();
        stdin.pause(); // Stdin stream starts off in this mode

        reader = new StdinReader(stdin);
    });

    describe('read()', function () {
        it('should return a Promise that resolves with the entire streamed PHP code', function () {
            var result;
            stdin._read.callsFake(function () {
                // Push as two separate chunks to test that we fetch and concatenate all
                stdin.push('<?php print "My ');
                stdin.push('message from PHP";');
                stdin.push(null); // Signal end of stream
            });

            result = reader.read();

            expect(result).to.be.an.instanceOf(Promise);
            return result.then(function (phpCode) {
                expect(phpCode).to.equal('<?php print "My message from PHP";');
            });
        });

        it('should set the stream encoding to UTF-8', function () {
            if (!('readableEncoding' in stdin)) {
                // Only added in Node.js v12.7.0
                this.skip();
            }

            reader.read();

            expect(stdin.readableEncoding).to.equal('utf8');
        });

        it('should resume the stream', function () {
            if (!('readableEncoding' in stdin)) {
                // Only added in Node.js v9.4.0
                this.skip();
            }

            reader.read();

            expect(stdin.readableFlowing).to.be.true;
        });
    });
});
