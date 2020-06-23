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

var path = require('path'),
    binaryName = path.basename(process.argv[1]).replace(/\.js$/, ''),
    dotPHP,
    dotPHPFactory = require('..'),
    filePath = null,
    fs = require('fs'),
    hasOwn = {}.hasOwnProperty,
    parsedOptions = require('minimist')(process.argv.slice(2), {
        '--': false,
        'string': ['help', 'dump-ast', 'f', 'r', 'run', 't', 'transpile-only', 'u'],
        'alias': {
            'f': 'file',
            'h': 'help',
            'r': 'run',
            's': 'sync',
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
    phpCommon = require('phpcommon'),
    phpParser,
    phpToAST = require('phptoast'),
    syncMode = hasOwn.call(parsedOptions, 'sync'),
    PHPError = phpCommon.PHPError,
    PHPParseError = phpCommon.PHPParseError;

/**
 * Handles a successful execution (one that didn't end with an exception being thrown)
 *
 * @param {Value} resultValue
 */
function handleSuccess(resultValue) {
    if (resultValue.getType() === 'exit') {
        // Don't explicitly exit with `process.exit(...)`, as there may be other I/O events to complete
        // `process.exitCode` will be respected if `.exit(...)` is not called or is called with no argument
        process.exitCode = resultValue.getStatus();
    }
}

/**
 * Handles a failed execution, where an error was thrown
 *
 * @param {Error} error
 */
function handleError(error) {
    if (!(error instanceof PHPError)) {
        throw error;
    }

    process.exitCode = error instanceof PHPParseError ? 254 : 255;
}

/**
 * Loads the DotPHP service
 *
 * @param {string|null} contextDirectory
 */
function loadDotPHP(contextDirectory) {
    if (contextDirectory) {
        contextDirectory = path.dirname(contextDirectory);
    }

    dotPHP = dotPHPFactory.create(contextDirectory);
}

/**
 * Executes the collected PHP code
 *
 * @param {string} phpCode
 */
function runPHP(phpCode) {
    // Only dump the AST to stdout if requested
    if (hasOwn.call(parsedOptions, 'dump-ast')) {
        phpParser = phpToAST.create();

        process.stdout.write(JSON.stringify(phpParser.parse(phpCode), null, 4) + '\n');
        return;
    }

    // Only dump the transpiled JS to stdout if requested
    if (hasOwn.call(parsedOptions, 'transpile-only')) {
        process.stdout.write(dotPHP.transpile(phpCode, filePath) + '\n');
        return;
    }

    if (syncMode) {
        // Synchronous mode

        try {
            dotPHP.bootstrapSync();

            handleSuccess(dotPHP.evaluateSync(phpCode, filePath));
        } catch (error) {
            handleError(error);
        }
    } else {
        // Asynchronous (Promise-based) mode

        dotPHP.bootstrap().then(function () {
            return dotPHP.evaluate(phpCode, filePath);
        }).then(function (resultValue) {
            handleSuccess(resultValue);

            // PHP program did not explicitly exit, nothing to do
        }, function (error) {
            handleError(error);
        });
    }
}

if (hasOwn.call(parsedOptions, 'run')) {
    // PHP has been given directly (without the `<?php` prefix) to be executed

    filePath = 'Command line code';
    loadDotPHP(null); // Use CWD

    runPHP('<?php ' + parsedOptions.run);
} else if (parsedOptions.file || parsedOptions._.length > 0) {
    // The path to a PHP file to execute has been given
    filePath = fs.realpathSync(parsedOptions.file || parsedOptions._[0]);

    loadDotPHP(filePath);
    runPHP(fs.readFileSync(filePath).toString());
} else if (hasOwn.call(parsedOptions, 'help')) {
    console.log([
        'Usage: ' + binaryName + ' <options> <path to PHP file>',
        '',
        '  -u / --dump-ast       - Dump AST of PHP code instead of executing it',
        '  -t / --transpile-only - Dump transpiled JS of PHP code instead of executing it',
        '  -r / --run=<code>     - Run PHP <code> without using script tags <? ... ?>',
        '  -s / --sync           - Run PHP code in synchronous mode for speed (default is asynchronous for compatibility)',
        '  -h / --help           - Show this help'
    ].join('\n'));

    process.exit(1);
} else {
    /**
     * No arguments given: stdin-reading mode:
     * - allows PHP code to be piped in, eg. `echo '<?php print 21;' | dotphp`
     * - ended with Ctrl+D in a TTY
     */

    filePath = 'Standard input code';
    loadDotPHP(null); // Use CWD

    dotPHP.readStdin().then(function (stdin) {
        runPHP(stdin);
    });
}
