/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    Promise = require('lie');

/**
 * Encapsulates reading PHP code streamed to stdin as a single string
 *
 * @param {object} stdin
 * @constructor
 */
function StdinReader(stdin) {
    /**
     * @type {object}
     */
    this.stdin = stdin;
}

_.extend(StdinReader.prototype, {
    /**
     * Reads all content from stdin, resolving the returned promise once stdin has been closed
     *
     * @returns {Promise}
     */
    read: function () {
        var reader = this;

        return new Promise(function (resolve) {
            var phpCode = '';

            reader.stdin.setEncoding('utf8');

            reader.stdin.on('data', function (chunk) {
                phpCode += chunk;
            });

            reader.stdin.on('end', function () {
                resolve(phpCode);
            });

            // Set stream to "flowing" mode, so that "data" events
            // will be emitted as data comes in
            reader.stdin.resume();
        });
    }
});

module.exports = StdinReader;
