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
 * @param {class} FileSystem
 * @param {fs} fs
 * @constructor
 */
function FileSystemFactory(FileSystem, fs) {
    /**
     * @type {class}
     */
    this.FileSystem = FileSystem;
    /**
     * @type {fs}
     */
    this.fs = fs;
}

_.extend(FileSystemFactory.prototype, {
    /**
     * Creates a new FileSystem
     *
     * @param {string} basePath
     * @return {FileSystem}
     */
    create: function (basePath) {
        var factory = this;

        return new factory.FileSystem(factory.fs, basePath);
    }
});

module.exports = FileSystemFactory;
