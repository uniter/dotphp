/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

/**
 * Network handling initialisers.
 */
module.exports = function (internals) {
    var socketStreamConnector = internals.getService('socket_stream_connector'),
        tcpServerFactory = internals.getBinding('tcp_server_factory');

    socketStreamConnector.setTcpServerFactory(tcpServerFactory);
};
