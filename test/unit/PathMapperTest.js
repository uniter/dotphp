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
    PathMapper = require('../../src/PathMapper');

describe('PathMapper', function () {
    var pathMapper;

    beforeEach(function () {
        pathMapper = new PathMapper({
            '/original/module_path.php': '/my/mapped_module_path.php',

            // Make sure we don't rely on inheriting Object.prototype.hasOwnProperty(...)
            'hasOwnProperty': '/my/mapped/hasOwnProperty.php' // jshint ignore:line
        });
    });

    describe('map()', function () {
        it('should return the mapped path when a mapping is specified', function () {
            expect(pathMapper.map('/original/module_path.php')).to.equal('/my/mapped_module_path.php');
        });

        it('should return the given path when no mapping is specified', function () {
            expect(pathMapper.map('/my/unmapped_path.php')).to.equal('/my/unmapped_path.php');
        });
    });
});
