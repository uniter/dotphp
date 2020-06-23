'use strict';

require('../../register')()
    .then(function () {
        return require('./call_plugin.php')().execute();
    })
    .catch(function (error) {
        console.error(error);
    });
