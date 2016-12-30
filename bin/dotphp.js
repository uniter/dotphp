#!/usr/bin/env node

/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var binaryName = require('path').basename(process.argv[1]).replace(/\.js$/, ''),
    dotPHP = require('..'),
    hasOwn = {}.hasOwnProperty,
    parsedOptions = require('minimist')(process.argv.slice(2), {
        '--': false,
        'string': ['help', 'dump-ast', 'f', 'r', 'run', 't', 'transpile-only', 'u'],
        'alias': {
            'f': 'file',
            'r': 'run',
            't': 'transpile-only',
            'u': 'dump-ast'
        },
        'unknown': function (option) {
            if (/^--?/.test(option)) {
                return false;
            }

            return true;
        }
    }),
    path = null,
    phpCode = null,
    phpParser,
    phpToAST = require('phptoast');

if (hasOwn.call(parsedOptions, 'run')) {
    phpCode = '<?php ' + parsedOptions.run;
} else if (parsedOptions.file || parsedOptions._.length > 0) {
    path = parsedOptions.file || parsedOptions._[0];
    phpCode = require('fs').readFileSync(path).toString();
}

if (phpCode === null) {
    console.log([
        'Usage: ' + binaryName + ' <options> <path to PHP file>',
        '',
        '  -u / --dump-ast       - Dump AST of PHP code instead of executing it',
        '  -t / --transpile-only - Dump transpiled JS of PHP code instead of executing it',
        '  -r / --run=<code>     - Run PHP <code> without using script tags <? ... ?>'
    ].join('\n'));

    process.exit(1);
}

// Only dump the AST to stdout if requested
if (hasOwn.call(parsedOptions, 'dump-ast')) {
    phpParser = phpToAST.create();

    process.stdout.write(JSON.stringify(phpParser.parse(phpCode), null, 4) + '\n');
    return;
}

// Only dump the transpiled JS to stdout if requested
if (hasOwn.call(parsedOptions, 'transpile-only')) {
    process.stdout.write(dotPHP.transpile(phpCode, path));
    return;
}

dotPHP.evaluate(phpCode, path).then(function (resultValue) {
    if (resultValue.getType() === 'exit') {
        // Don't explicitly exit with `process.exit(...)`, as there may be other I/O events to complete
        // `process.exitCode` will be respected if `.exit(...)` is not called or is called with no argument
        process.exitCode = resultValue.getStatus();
        return;
    }

    // PHP program did not explicitly exit, nothing to do
});
