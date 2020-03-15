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
    expect = require('chai').expect,
    nowdoc = require('nowdoc');

describe('DotPHP binary --run option integration', function () {
    it('should correctly run a program that just prints a number', function (done) {
        childProcess.exec(
            __dirname + '/../../../bin/dotphp.js -r "print 21;"',
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
            __dirname + '/../../../bin/dotphp.js -r "myUndefinedFunc();"',
            function (error, stdout, stderr) {
                // NB: Stdout should have a leading newline written out just before the message
                expect(stdout).to.equal(
                    nowdoc(function () {/*<<<EOS

Fatal error: Uncaught Error: Call to undefined function myUndefinedFunc() in Command line code:1
Stack trace:
#0 {main}
  thrown in Command line code on line 1

EOS
*/;}) // jshint ignore:line
                );
                expect(stderr).to.equal(
                    nowdoc(function () {/*<<<EOS
PHP Fatal error:  Uncaught Error: Call to undefined function myUndefinedFunc() in Command line code:1
Stack trace:
#0 {main}
  thrown in Command line code on line 1

EOS
*/;}) // jshint ignore:line
                );
                expect(error).not.to.be.null;
                expect(error.code).to.equal(255);
                done();
            }
        );
    });

    it('should correctly run a program that contains a syntax error', function (done) {
        childProcess.exec(
            __dirname + '/../../../bin/dotphp.js -r "my <invalid PHP"',
            function (error, stdout, stderr) {
                expect(stdout).to.equal('\nParse error: syntax error, unexpected \'P\' in Command line code on line 1\n');
                expect(stderr).to.equal('PHP Parse error:  syntax error, unexpected \'P\' in Command line code on line 1\n');
                expect(error).not.to.be.null;
                expect(error.code).to.equal(254);
                done();
            }
        );
    });
});
