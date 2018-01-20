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

describe('DotPHP binary piping of PHP code to stdin integration', function () {
    it('should correctly run a program that just prints a number', function (done) {
        childProcess.exec(
            'echo "<?php print 101;" | ' + __dirname + '/../../../bin/dotphp.js',
            function (error, stdout, stderr) {
                expect(stdout).to.equal('101');
                expect(stderr).to.equal('');
                expect(error).to.be.null;
                done();
            }
        );
    });

    it('should correctly run a program that raises a runtime error', function (done) {
        childProcess.exec(
            'echo "<?php myUndefinedFunc();" | ' + __dirname + '/../../../bin/dotphp.js',
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
            'echo "<?php my <invalid PHP" | ' + __dirname + '/../../../bin/dotphp.js',
            function (error, stdout, stderr) {
                expect(stdout).to.equal('');
                expect(stderr).to.contain('PHP Parse error: syntax error, unexpected \'P\' in (program) on line 1');
                expect(error).not.to.be.null;
                expect(error.code).to.equal(254);
                done();
            }
        );
    });
});
