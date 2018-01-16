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
 * @param {Process} process
 * @constructor
 */
function FileSystemFactory(FileSystem, fs, streamFactory, process) {
    /**
     * @type {class}
     */
    this.FileSystem = FileSystem;
    /**
     * @type {fs}
     */
    this.fs = fs;
    /**
     * @type {Process}
     */
    this.process = process;
    /**
     * @type {StreamFactory}
     */
    this.streamFactory = streamFactory;
}

_.extend(FileSystemFactory.prototype, {
    /**
     * Creates a new FileSystem
     *
     * @return {FileSystem}
     */
    create: function () {
        var factory = this;

        return new factory.FileSystem(factory.fs, factory.streamFactory, factory.process);
    }
});

module.exports = FileSystemFactory;
