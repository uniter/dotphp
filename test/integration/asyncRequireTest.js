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

describe('DotPHP .require(...) integration - asynchronous module require', function () {
    beforeEach(function () {
        tools.init.call(this);
    });

    it('should correctly require a PHP module that just returns 21', function () {
        this.fs.readFileSync
            .withArgs('/real/path/to/my/module.php')
            .returns({toString: sinon.stub().returns('<?php $myVar = 21; return $myVar;')});

        return this.dotPHP.require('/real/path/to/my/module.php')().execute().then(function (result) {
            expect(result.getNative()).to.equal(21);
        });
    });

    it('should correctly require a PHP module that includes another', function () {
        this.fs.realpathSync.withArgs('/path/to/my/module.php').returns('/real/path/to/my/module.php');
        this.fs.readFileSync
            .withArgs('/real/path/to/my/module.php')
            .returns({toString: sinon.stub().returns('<?php $myVar = require "../another.php"; return $myVar + 21;')});
        this.fs.realpathSync.withArgs('/real/path/to/another.php').returns('/real/path/to/another.php');
        this.fs.readFileSync
            .withArgs('/real/path/to/another.php')
            .returns({toString: sinon.stub().returns('<?php $anotherVar = 1000; return $anotherVar;')});

        return this.dotPHP.require('/real/path/to/my/module.php')().execute().then(function (result) {
            expect(result.getNative()).to.equal(1021);
        });
    });
});
