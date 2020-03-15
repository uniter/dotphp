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
    tools = require('./tools');

describe('DotPHP .requireSync(...) integration - synchronous module require', function () {
    beforeEach(function () {
        tools.init.call(this);
    });

    it('should correctly require a PHP module that just returns 21', function () {
        this.fs.readFileSync
            .withArgs('/real/path/to/my/module.php')
            .returns({toString: sinon.stub().returns('<?php $myVar = 21; return $myVar;')});
        // Use a cwd that is different to the dir the module file is in to test cwd handling
        this.process.cwd.returns('/some/other/path/as/cwd');

        expect(this.dotPHP.requireSync('/real/path/to/my/module.php')().execute().getNative()).to.equal(21);
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

        expect(this.dotPHP.requireSync('/real/path/to/my/module.php')().execute().getNative()).to.equal(1021);
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

        this.dotPHP.requireSync('/real/path/to/my/module.php')().execute();

        expect(this.stdoutOutput).to.deep.equal(['1000', '21']);
        expect(this.stderrOutput).to.deep.equal([]);
    });
});
