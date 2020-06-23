'use strict';

module.exports = {
    settings: {
        dotphp: {
            bootstraps: [__dirname + '/my_bootstrap.php'],
            map: {
                [__dirname + '/replaced_module.php']: __dirname + '/replacing_module.php'
            }
        },
        phpcore: {
            plugins: [
                require('./my_plugin.js')
            ]
        }
    }
};
