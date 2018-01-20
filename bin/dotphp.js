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
    filePath = null,
    fs = require('fs'),
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
    phpParser,
    phpToAST = require('phptoast'),
    PHPParseError = require('phpcommon').PHPParseError;

function runPHP(phpCode) {
    // Only dump the AST to stdout if requested
    if (hasOwn.call(parsedOptions, 'dump-ast')) {
        phpParser = phpToAST.create();

        process.stdout.write(JSON.stringify(phpParser.parse(phpCode), null, 4) + '\n');
        return;
    }

    // Only dump the transpiled JS to stdout if requested
    if (hasOwn.call(parsedOptions, 'transpile-only')) {
        process.stdout.write(dotPHP.transpile(phpCode, filePath));
        return;
    }

    dotPHP.evaluate(phpCode, filePath).then(function (resultValue) {
        if (resultValue.getType() === 'exit') {
            // Don't explicitly exit with `process.exit(...)`, as there may be other I/O events to complete
            // `process.exitCode` will be respected if `.exit(...)` is not called or is called with no argument
            process.exitCode = resultValue.getStatus();
            return;
        }

        // PHP program did not explicitly exit, nothing to do
    }, function (error) {
        process.stderr.write(error.message + '\n');
        process.exitCode = error instanceof PHPParseError ? 254 : 255;
    });
}

if (hasOwn.call(parsedOptions, 'run')) {
    // PHP has been given directly (without the `<?php` prefix) to be executed

    runPHP('<?php ' + parsedOptions.run);
} else if (parsedOptions.file || parsedOptions._.length > 0) {
    // The path to a PHP file to execute has been given

    filePath = parsedOptions.file || parsedOptions._[0];

    fs.readFile(filePath, function (error, contentBuffer) {
        runPHP(contentBuffer.toString());
    });
} else if (process.argv.length === 2) {
    /**
     * No arguments given: stdin-reading mode:
     * - allows PHP code to be piped in, eg. `echo '<?php print 21;' | dotphp`
     * - ended with Ctrl+D in a TTY
     */

    dotPHP.readStdin().then(function (stdin) {
        runPHP(stdin);
    });
} else {
    console.log([
        'Usage: ' + binaryName + ' <options> <path to PHP file>',
        '',
        '  -u / --dump-ast       - Dump AST of PHP code instead of executing it',
        '  -t / --transpile-only - Dump transpiled JS of PHP code instead of executing it',
        '  -r / --run=<code>     - Run PHP <code> without using script tags <? ... ?>'
    ].join('\n'));

    process.exit(1);
}
