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
    tools = require('./tools');

describe('DotPHP .transpile(...) integration - synchronous PHP transpilation', function () {
    beforeEach(function () {
        // Use the minimal config so that no source map is included
        tools.init.call(this, __dirname + '/fixtures/sync.minimal');
    });

    it('should correctly transpile a program with a simple top-level return statement', function () {
        var result = this.dotPHP.transpile('<?php return "my result";', '/my/module.php');

        expect(result).to.equal(
            nowdoc(function () {/*<<<EOS
require('phpruntime/sync').compile(function(stdin, stdout, stderr, tools, namespace) {
  var namespaceScope = tools.topLevelNamespaceScope,
    namespaceResult, scope = tools.topLevelScope,
    currentClass = null;
  var line;
  tools.instrument(function() {
    return line;
  });
  line = 1;
  return (line = 1, tools.valueFactory.createString("my result"));
  return tools.valueFactory.createNull();
});
EOS
*/;}) // jshint ignore:line
        );
    });
});
