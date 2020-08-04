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

describe('DotPHP integration tests to sanity check correct operation of the demo scripts', function () {
    it('should correctly run the Composer demo', function (done) {
        this.timeout(10000); // Allow extra time for this long demo test

        childProcess.exec(
            process.execPath + ' ' + __dirname + '/../../../demos/composer/demo.js',
            function (error, stdout, stderr) {
                if (error) {
                    done(error);
                    return;
                }

                expect(stdout).to.contain('Hello from listener!\nand then\nHello from listener!');
                expect(stderr).to.equal('');
                expect(error).to.be.null;
                done();
            }
        );
    });

    it('should correctly run the Include demo', function (done) {
        this.timeout(10000); // Allow extra time for this long demo test

        childProcess.exec(
            process.execPath + ' ' + __dirname + '/../../../demos/include/include.js',
            function (error, stdout, stderr) {
                if (error) {
                    done(error);
                    return;
                }

                expect(stdout).to.contain('First + second is: 121');
                expect(stderr).to.equal('');
                expect(error).to.be.null;
                done();
            }
        );
    });

    it('should correctly run the Plugin demo', function (done) {
        this.timeout(10000); // Allow extra time for this long demo test

        childProcess.exec(
            process.execPath + ' ' + __dirname + '/../../../demos/plugin/demo.js',
            function (error, stdout, stderr) {
                if (error) {
                    done(error);
                    return;
                }

                expect(stdout).to.contain('I replace replaced_module.php!');
                expect(stdout).to.contain('demos/plugin/call_addon.php.\nHello via plugin!');
                expect(stdout).to.contain('Binding option: my binding option value');
                expect(stderr).to.equal('');
                expect(error).to.be.null;
                done();
            }
        );
    });

    it('should correctly run the Simple Require demo', function (done) {
        this.timeout(10000); // Allow extra time for this long demo test

        childProcess.exec(
            process.execPath + ' ' + __dirname + '/../../../demos/simpleRequire/simpleRequire.js',
            function (error, stdout, stderr) {
                if (error) {
                    done(error);
                    return;
                }

                expect(stdout).to.contain('demos/simpleRequire/print27.php.\nThis is 27.');
                expect(stderr).to.equal('');
                expect(error).to.be.null;
                done();
            }
        );
    });
});
