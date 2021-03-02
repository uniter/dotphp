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
 * Manages an Environment for asynchronous, Promise-synchronous and synchronous Uniter modes
 *
 * @param {Runtime} asyncRuntime
 * @param {Runtime} psyncRuntime
 * @param {Runtime} syncRuntime
 * @param {IO} io
 * @param {IncluderFactory} includerFactory
 * @param {FileSystem} fileSystem
 * @param {Performance} performance
 * @param {ConfigSet} phpCoreConfigSet
 * @param {string} mode
 * @constructor
 */
function EnvironmentProvider(
    asyncRuntime,
    psyncRuntime,
    syncRuntime,
    io,
    includerFactory,
    fileSystem,
    performance,
    phpCoreConfigSet,
    mode
) {
    /**
     * @type {Runtime}
     */
    this.asyncRuntime = asyncRuntime;
    /**
     * @type {Environment|null}
     */
    this.environment = null;
    /**
     * @type {FileSystem}
     */
    this.fileSystem = fileSystem;
    /**
     * @type {IncluderFactory}
     */
    this.includerFactory = includerFactory;
    /**
     * @type {IO}
     */
    this.io = io;
    /**
     * @type {string}
     */
    this.mode = mode;
    /**
     * @type {Performance}
     */
    this.performance = performance;
    /**
     * @type {ConfigSet}
     */
    this.phpCoreConfigSet = phpCoreConfigSet;
    /**
     * @type {Runtime}
     */
    this.psyncRuntime = psyncRuntime;
    /**
     * @type {Runtime}
     */
    this.syncRuntime = syncRuntime;
}

_.extend(EnvironmentProvider.prototype, {
    /**
     * Fetches the Environment for the runtime using the current synchronicity mode,
     * lazily creating it if needed
     *
     * @param {Compiler} compiler
     * @returns {Environment}
     */
    getEnvironment: function (compiler) {
        var effectiveRuntime,
            environmentOptions,
            provider = this;

        if (provider.environment !== null) {
            return provider.environment;
        }

        if (provider.mode === 'async') {
            effectiveRuntime = provider.asyncRuntime;
        } else if (provider.mode === 'psync') {
            effectiveRuntime = provider.psyncRuntime;
        } else {
            effectiveRuntime = provider.syncRuntime;
        }

        environmentOptions = Object.assign({}, provider.phpCoreConfigSet.mergeAll(), {
            fileSystem: provider.fileSystem,
            include: provider.includerFactory.create(compiler, provider.fileSystem),
            performance: provider.performance
        });

        // Keep things simple by not passing the special "addons" list through as a config option
        delete environmentOptions.addons;

        provider.environment = effectiveRuntime.createEnvironment(
            // Pass the non-addon config options through
            environmentOptions,
            // Fetch all addons that may have been installed across all Uniter platform-level plugins
            // and the root level config
            provider.phpCoreConfigSet.concatArrays('addons')
        );

        provider.io.install(provider.environment);

        return provider.environment;
    }
});

module.exports = EnvironmentProvider;
