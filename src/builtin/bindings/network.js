/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var net = require('net');

/**
 * Network handling bindings.
 */
module.exports = function () {
    return {
        'tcp_server_factory': function () {
            function TcpServerFactory() {

            }

            TcpServerFactory.prototype.createServer = function () {
                return net.createServer();
            };

            return new TcpServerFactory();
        }
    };
};
