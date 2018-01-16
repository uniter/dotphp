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
    path = require('path'),
    Promise = require('lie');

/**
 * Abstraction layer around Node's FS module for PHP programs to use
 *
 * @param {fs} fs
 * @param {StreamFactory} streamFactory
 * @param {Process} process
 * @constructor
 */
function FileSystem(fs, streamFactory, process) {
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
     * Opens a Stream for the specified file asynchronously
     *
     * @param {string} filePath
     * @returns {Promise} Resolves with a Stream for the file on success, rejects on failure
     */
    open: function (filePath) {
        var fileSystem = this,
            realPath = fileSystem.realPath(filePath);

        return new Promise(function (resolve, reject) {
            fileSystem.fs.open(realPath, 'w+', function (error, fd) {
                if (error) {
                    return reject(error);
                }

                resolve(fileSystem.streamFactory.create(realPath, fd));
            });
        });
    },

    /**
     * Opens a Stream for the specified file synchronously
     *
     * @param {string} filePath
     * @returns {Stream}
     */
    openSync: function (filePath) {
        var fileSystem = this,
            realPath = fileSystem.realPath(filePath),
            fd = fileSystem.fs.openSync(realPath, 'w+');

        return fileSystem.streamFactory.create(realPath, fd);
    },

    /**
     * Converts the specified module path to a full one,
     * normalizing any parent- or current-directory symbols
     *
     * @param {string} filePath
     * @returns {string|null}
     */
    realPath: function (filePath) {
        var fileSystem = this,
            relativePath = path.resolve(fileSystem.process.cwd(), filePath);

        try {
            return fileSystem.fs.realpathSync(relativePath);
        } catch (error) {
            return null;
        }
    },

    /**
     * Deletes a file asynchronously
     *
     * @param {string} filePath
     * @returns {Promise} Resolves on success, rejects on failure
     */
    unlink: function (filePath) {
        var fileSystem = this,
            realPath = fileSystem.realPath(filePath);

        return new Promise(function (resolve, reject) {
            fileSystem.fs.unlink(realPath, function (error) {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    },

    /**
     * Deletes a file synchronously
     *
     * @param {string} filePath
     */
    unlinkSync: function (filePath) {
        var fileSystem = this,
            realPath = fileSystem.realPath(filePath);

        fileSystem.fs.unlinkSync(realPath);
    }
});

module.exports = FileSystem;
