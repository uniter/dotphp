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
 * @param {fs} fs FS module
 * @param {string} path
 * @param {number} fd File descriptor
 * @constructor
 */
function Stream(fs, path, fd) {
    /**
     * @type {boolean}
     */
    this.closed = false;
    /**
     * @type {number}
     */
    this.fd = fd;
    /**
     * @type {fs}
     */
    this.fs = fs;
    /**
     * @type {string}
     */
    this.path = path;
    /**
     * @type {number}
     */
    this.position = 0;
}

_.extend(Stream.prototype, {
    /**
     * Closes this stream so it is no longer accessible
     *
     * @returns {Promise}
     * @throws {Error} Throws if the stream has already been closed
     */
    close: function () {
        var stream = this;

        return new Promise(function (resolve, reject) {
            if (stream.closed) {
                return reject(new Error('Stream has already been closed'));
            }

            stream.fs.close(stream.fd, function (error) {
                if (error) {
                    return reject(error);
                }

                stream.closed = true;
                resolve();
            });
        });
    },

    /**
     * Closes this stream so it is no longer accessible (synchronous version)
     *
     * @throws {Error} Throws if the stream has already been closed
     */
    closeSync: function () {
        var stream = this;

        if (stream.closed) {
            throw new Error('Stream has already been closed');
        }

        stream.fs.closeSync(stream.fd);
        stream.closed = true;
    },

    /**
     * Writes the specified data to the stream
     *
     * @param {string} data
     * @returns {Promise}
     */
    write: function (data) {
        var stream = this;

        return new Promise(function (resolve, reject) {
            if (stream.closed) {
                return reject(new Error('Stream has been closed'));
            }

            stream.fs.write(stream.fd, data, stream.position, data.length, function (error, bytesWritten) {
                if (error) {
                    return reject(error);
                }

                stream.position += bytesWritten;
                resolve(bytesWritten);
            });
        });
    },

    /**
     * Writes the specified data to the stream (synchronous version)
     *
     * @param {string} data
     * @returns {number} Number of bytes written
     */
    writeSync: function (data) {
        var bytesWritten,
            stream = this;

        if (stream.closed) {
            throw new Error('Stream has been closed');
        }

        bytesWritten = stream.fs.writeSync(stream.fd, data, stream.position, data.length);
        stream.position += bytesWritten;

        return bytesWritten;
    }
});

module.exports = Stream;
