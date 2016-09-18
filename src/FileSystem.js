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
    path = require('path');

/**
 * Virtual FileSystem for use in the browser with compiled PHP modules
 *
 * @param {fs} fs
 * @param {string} basePath
 * @constructor
 */
function FileSystem(fs, basePath) {
    /**
     * @type {string}
     */
    this.basePath = basePath;
    /**
     * @type {fs}
     */
    this.fs = fs;
}

_.extend(FileSystem.prototype, {
    /**
     * Determines whether the specified directory path exists in the FileSystem.
     * Currently always returns true, as we cannot be sure from the info we have
     *
     * @returns {boolean}
     */
    isDirectory: function (filePath) {
        var fileSystem = this,
            realPath = fileSystem.realPath(filePath);

        try {
            return fileSystem.fs.statSync(realPath).isDirectory();
        } catch (e) {
            return false;
        }
    },

    /**
     * Determines whether the specified file exists in the FileSystem.
     * Currently only compiled PHP modules can be in the FileSystem, so only those
     * may be detected.
     *
     * @param {string} filePath
     * @returns {boolean}
     */
    isFile: function (filePath) {
        var fileSystem = this,
            realPath = fileSystem.realPath(filePath);

        try {
            return fileSystem.fs.statSync(realPath).isFile();
        } catch (e) {
            return false;
        }
    },

    /**
     * Converts the specified module path to a full one,
     * normalizing any parent- or current-directory symbols
     *
     * @param {string} filePath
     * @returns {string}
     */
    realPath: function (filePath) {
        var fileSystem = this,
            relativePath = path.resolve(fileSystem.basePath, filePath);

        return fileSystem.fs.realpathSync(relativePath);
    }
});

module.exports = FileSystem;
