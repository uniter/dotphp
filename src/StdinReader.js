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

            reader.stdin.on('readable', function () {
                var chunk = reader.stdin.read();

                if (chunk !== null) {
                    phpCode += chunk;
                }
            });

            reader.stdin.on('end', function () {
                resolve(phpCode);
            });
        });
    }
});

module.exports = StdinReader;
