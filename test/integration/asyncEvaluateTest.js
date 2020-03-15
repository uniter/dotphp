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

describe('DotPHP .evaluate(...) integration - asynchronous PHP evaluation', function () {
    beforeEach(function () {
        tools.init.call(this);
    });

    it('should correctly evaluate a program with a simple top-level return statement', function () {
        return this.dotPHP.evaluate('<?php return "my result";', '/my/module.php').then(function (result) {
            expect(result.getType()).to.equal('string');
            expect(result.getNative()).to.equal('my result');
        });
    });

    it('should correctly evaluate a program with an explicit exit code', function () {
        return this.dotPHP.evaluate('<?php exit(21);', '/my/module.php').then(function (result) {
            expect(result.getType()).to.equal('exit');
            expect(result.getStatus()).to.equal(21);
        });
    });

    it('should perform evaluations in a shared environment', function () {
        // Define a variable that the second evaluation should be able to access
        return this.dotPHP.evaluate('<?php $myVar = 1001;', '/my/first_module.php').then(function () {
            return this.dotPHP.evaluate('<?php return $myVar * 2;', '/my/second_module.php').then(function (result) {
                expect(result.getType()).to.equal('int');
                expect(result.getNative()).to.equal(2002);
            }.bind(this));
        }.bind(this));
    });
});
