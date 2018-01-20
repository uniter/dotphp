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

describe('DotPHP binary PHP file path integration', function () {
    it('should correctly run a PHP file whose path is given as an argument', function (done) {
        childProcess.exec(
            __dirname + '/../../../bin/dotphp.js ' + __dirname + '/../fixtures/print_number.php',
            function (error, stdout, stderr) {
                expect(stdout).to.equal('1021');
                expect(stderr).to.equal('');
                expect(error).to.be.null;
                done();
            }
        );
    });
});
