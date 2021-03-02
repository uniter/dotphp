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
    nowdoc = require('nowdoc'),
    phpCommon = require('phpcommon'),
    sinon = require('sinon'),
    tools = require('./tools'),
    PHPFatalError = phpCommon.PHPFatalError;

describe('DotPHP .require(...) integration - synchronous module require', function () {
    beforeEach(function () {
        tools.init.call(this, __dirname + '/fixtures/sync');
    });

    it('should correctly require a PHP module that just returns 21', function () {
        this.fs.readFileSync
            .withArgs('/real/path/to/my/module.php')
            .returns({toString: sinon.stub().returns('<?php $myVar = 21; return $myVar;')});
        // Use a cwd that is different to the dir the module file is in to test cwd handling
        this.process.cwd.returns('/some/other/path/as/cwd');

        expect(this.dotPHP.require('/real/path/to/my/module.php')().execute().getNative()).to.equal(21);
    });

    it('should correctly require a PHP module that includes another', function () {
        this.fs.realpathSync.withArgs('/path/to/my/module.php').returns('/real/path/to/my/module.php');
        this.fs.readFileSync
            .withArgs('/real/path/to/my/module.php')
            .returns({toString: sinon.stub().returns('<?php $myVar = require "../another.php"; return $myVar + 21;')});
        this.fs.realpathSync.withArgs('/real/path/to/another.php').returns('/real/path/to/another.php');
        this.fs.readFileSync
            .withArgs('/my/real/another.php')
            .returns({toString: sinon.stub().returns('<?php $anotherVar = 1000; return $anotherVar;')});
        // Set the cwd for the `../another.php` path above to be resolved against
        this.process.cwd.returns('/my/real/cwd');

        expect(this.dotPHP.require('/real/path/to/my/module.php')().execute().getNative()).to.equal(1021);
    });

    it('should correctly require a PHP module that includes another where both print', function () {
        this.fs.realpathSync.withArgs('/path/to/my/module.php').returns('/real/path/to/my/module.php');
        this.fs.readFileSync
            .withArgs('/real/path/to/my/module.php')
            .returns({toString: sinon.stub().returns('<?php require "../another.php"; print 21;')});
        this.fs.realpathSync.withArgs('/real/path/to/another.php').returns('/real/path/to/another.php');
        this.fs.readFileSync
            .withArgs('/my/real/another.php')
            .returns({toString: sinon.stub().returns('<?php $anotherVar = 1000; print $anotherVar;')});
        // Set the cwd for the `../another.php` path above to be resolved against
        this.process.cwd.returns('/my/real/cwd');

        this.dotPHP.require('/real/path/to/my/module.php')().execute();

        expect(this.stdoutOutput).to.deep.equal(['1000', '21']);
        expect(this.stderrOutput).to.deep.equal([]);
    });

    it('should correctly handle a PHP module that attempts to include a non-existent other', function () {
        var engine,
            fsSystemError = new Error('Some error attempting to read the file');
        fsSystemError.code = 'ENOENT';
        this.fs.realpathSync.withArgs('/path/to/my/module.php').returns('/real/path/to/my/module.php');
        this.fs.readFileSync
            .withArgs('/real/path/to/my/module.php')
            .returns({toString: sinon.stub().returns('<?php\n$myVar = require "../non_existent.php"; return $myVar + 21;')});
        this.fs.realpathSync.withArgs('/real/path/to/non_existent.php').returns('/real/path/to/non_existent.php');
        this.fs.readFileSync
            .withArgs('/my/real/non_existent.php')
            .throws(fsSystemError);
        // Set the cwd for the `../another.php` path above to be resolved against
        this.process.cwd.returns('/my/real/cwd');

        engine = this.dotPHP.require('/real/path/to/my/module.php')();

        expect(function () {
            engine.execute();
        }).to.throw(
            PHPFatalError,
            'require(): Failed opening \'../non_existent.php\' for inclusion in /real/path/to/my/module.php on line 2'
        );
        // NB: Stdout should have a leading newline written out just before the message
        expect(engine.getStdout().readAll()).to.equal(
            nowdoc(function () {/*<<<EOS

Warning: require(../non_existent.php): failed to open stream: No such file or directory in /real/path/to/my/module.php on line 2

Fatal error: require(): Failed opening '../non_existent.php' for inclusion in /real/path/to/my/module.php on line 2

EOS
*/;}) // jshint ignore:line
        );
        expect(engine.getStderr().readAll()).to.equal(
            nowdoc(function () {/*<<<EOS
PHP Warning:  require(../non_existent.php): failed to open stream: No such file or directory in /real/path/to/my/module.php on line 2
PHP Fatal error:  require(): Failed opening '../non_existent.php' for inclusion in /real/path/to/my/module.php on line 2

EOS
*/;}) // jshint ignore:line
        );
    });
});
