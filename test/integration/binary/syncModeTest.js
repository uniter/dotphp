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

describe('DotPHP binary synchronous mode option integration', function () {
    it('should correctly run a program that just prints a number', function (done) {
        childProcess.exec(
            __dirname + '/../../../bin/dotphp.js -r "print 21;" --sync',
            function (error, stdout, stderr) {
                expect(stdout).to.equal('21');
                expect(stderr).to.equal('');
                expect(error).to.be.null;
                done();
            }
        );
    });

    it('should correctly run a program that raises a runtime error', function (done) {
        childProcess.exec(
            __dirname + '/../../../bin/dotphp.js -r "myUndefinedFunc();" --sync',
            function (error, stdout, stderr) {
                expect(stdout).to.equal('');
                expect(stderr).to.contain('PHP Fatal error: Call to undefined function myUndefinedFunc()');
                expect(error).not.to.be.null;
                expect(error.code).to.equal(255);
                done();
            }
        );
    });

    it('should correctly run a program that contains a syntax error', function (done) {
        childProcess.exec(
            __dirname + '/../../../bin/dotphp.js -r "my <invalid PHP" --sync',
            function (error, stdout, stderr) {
                expect(stdout).to.equal('');
                expect(stderr).to.contain('PHP Parse error: syntax error, unexpected \'P\' in (program) on line 1');
                expect(error).not.to.be.null;
                expect(error.code).to.equal(254);
                done();
            }
        );
    });

    it('should exit the node process with the exit code passed to the exit statement', function (done) {
        childProcess.exec(
            __dirname + '/../../../bin/dotphp.js -r "exit(40);" --sync',
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
