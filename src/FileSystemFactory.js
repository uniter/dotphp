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
 * @param {StreamFactory} streamFactory
 * @constructor
 */
function FileSystemFactory(FileSystem, fs, streamFactory) {
    /**
     * @type {class}
     */
    this.FileSystem = FileSystem;
    /**
     * @type {fs}
     */
    this.fs = fs;
    /**
     * @type {StreamFactory}
     */
    this.streamFactory = streamFactory;
}

_.extend(FileSystemFactory.prototype, {
    /**
     * Creates a new FileSystem
     *
     * @param {string} basePath
     * @return {FileSystem}
     */
    create: function (basePath) {
        var factory = this,
            absoluteBasePath = factory.fs.realpathSync(basePath);

        return new factory.FileSystem(factory.fs, factory.streamFactory, absoluteBasePath);
    }
});

module.exports = FileSystemFactory;
