/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash');

/**
 * @param {class} Stream
 * @param {fs} fs FS module
 * @constructor
 */
function StreamFactory(Stream, fs) {
    /**
     * @type {fs}
     */
    this.fs = fs;
    /**
     * @type {class}
     */
    this.Stream = Stream;
}

_.extend(StreamFactory.prototype, {
    /**
     * Creates a new Stream
     *
     * @param {string} path
     * @param {number} fd
     * @returns {Stream}
     */
    create: function (path, fd) {
        var factory = this;

        return new factory.Stream(factory.fs, path, fd);
    }
});

module.exports = StreamFactory;
