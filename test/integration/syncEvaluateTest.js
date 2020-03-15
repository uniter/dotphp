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
    tools = require('./tools');

describe('DotPHP .evaluateSync(...) integration - synchronous PHP evaluation', function () {
    beforeEach(function () {
        tools.init.call(this);
    });

    it('should correctly evaluate a program with a simple top-level return statement', function () {
        var result = this.dotPHP.evaluateSync('<?php return "my result";', '/my/module.php');

        expect(result.getType()).to.equal('string');
        expect(result.getNative()).to.equal('my result');
    });

    it('should correctly evaluate a program with an explicit exit code', function () {
        var result = this.dotPHP.evaluateSync('<?php exit(21);', '/my/module.php');

        expect(result.getType()).to.equal('exit');
        expect(result.getStatus()).to.equal(21);
    });

    it('should perform evaluations in a shared environment', function () {
        var result;
        // Define a variable that the second evaluation should be able to access
        this.dotPHP.evaluateSync('<?php $myVar = 1001;', '/my/first_module.php');

        result = this.dotPHP.evaluateSync('<?php return $myVar * 2;', '/my/second_module.php');

        expect(result.getType()).to.equal('int');
        expect(result.getNative()).to.equal(2002);
    });
});
