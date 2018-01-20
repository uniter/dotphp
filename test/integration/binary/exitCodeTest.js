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

describe('DotPHP binary exit code integration', function () {
    it('should exit the node process with the exit code passed to the exit statement', function (done) {
        childProcess.exec(
            __dirname + '/../../../bin/dotphp.js -r "exit(40);"',
            function (error, stdout, stderr) {
                expect(stdout).to.equal('');
                expect(stderr).to.equal('');
                expect(error).not.to.be.null;
                expect(error.code).to.equal(40);
                done();
            }
        );
    });
});
