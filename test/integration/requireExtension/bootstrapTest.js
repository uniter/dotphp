/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var childProcess = require('child_process'),
    expect = require('chai').expect;

describe('DotPHP require extension bootstrap integration', function () {
    it('should correctly handle a bootstrap .php file exiting', function (done) {
        childProcess.exec(
            process.execPath + ' ' + __dirname + '/../fixtures/requireExtension/bootstrap/entry.js',
            function (error, stdout, stderr) {
                expect(stdout).to.equal('Hello from bootstrap');
                expect(stderr).to.equal('');
                expect(error).not.to.be.null;
                expect(error.code).to.equal(123);
                done();
            }
        );
    });
});
