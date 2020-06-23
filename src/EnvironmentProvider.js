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
 * Manages an Environment for both asynchronous and synchronous Uniter modes
 *
 * @param {Runtime} asyncRuntime
 * @param {Runtime} syncRuntime
 * @param {IO} io
 * @param {FileSystem} fileSystem
 * @param {Performance} performance
 * @param {ConfigSet} phpCoreConfigSet
 * @constructor
 */
function EnvironmentProvider(
    asyncRuntime,
    syncRuntime,
    io,
    fileSystem,
    performance,
    phpCoreConfigSet
) {
    /**
     * @type {Environment|null}
     */
    this.asyncEnvironment = null;
    /**
     * @type {Runtime}
     */
    this.asyncRuntime = asyncRuntime;
    /**
     * @type {FileSystem}
     */
    this.fileSystem = fileSystem;
    /**
     * @type {IO}
     */
    this.io = io;
    /**
     * @type {Performance}
     */
    this.performance = performance;
    /**
     * @type {ConfigSet}
     */
    this.phpCoreConfigSet = phpCoreConfigSet;
    /**
     * @type {Environment|null}
     */
    this.syncEnvironment = null;
    /**
     * @type {Runtime}
     */
    this.syncRuntime = syncRuntime;
}

_.extend(EnvironmentProvider.prototype, {
    /**
     * Fetches the Environment for the asynchronous runtime, lazily creating it if needed
     *
     * @returns {Environment}
     */
    getAsyncEnvironment: function () {
        var provider = this;

        if (provider.asyncEnvironment === null) {
            provider.asyncEnvironment = provider.asyncRuntime.createEnvironment(
                {
                    fileSystem: provider.fileSystem,
                    performance: provider.performance
                },
                // Fetch all plugins that may have been installed across all Uniter config-level presets
                // and the root level config
                provider.phpCoreConfigSet.concatArrays('plugins')
            );

            provider.io.install(provider.asyncEnvironment);
        }

        return provider.asyncEnvironment;
    },

    /**
     * Fetches the Environment for either the asynchronous or synchronous runtime,
     * based on the mode given, lazily creating it if needed
     *
     * @param {Mode} mode
     * @returns {Environment}
     */
    getEnvironmentForMode: function (mode) {
        var provider = this;

        return mode.isSynchronous() ? provider.getSyncEnvironment() : provider.getAsyncEnvironment();
    },

    /**
     * Fetches the Environment for the synchronous runtime, lazily creating it if needed
     *
     * @returns {Environment}
     */
    getSyncEnvironment: function () {
        var provider = this;

        if (provider.syncEnvironment === null) {
            provider.syncEnvironment = provider.syncRuntime.createEnvironment(
                {
                    fileSystem: provider.fileSystem,
                    performance: provider.performance
                },
                // Fetch all plugins that may have been installed across all Uniter config-level presets
                // and the root level config
                provider.phpCoreConfigSet.concatArrays('plugins')
            );

            provider.io.install(provider.syncEnvironment);
        }

        return provider.syncEnvironment;
    }
});

module.exports = EnvironmentProvider;
