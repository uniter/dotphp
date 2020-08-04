'use strict';

require('../../register')()
    .then(function () {
        return require('./call_addon.php')().execute();
    })
    .catch(function (error) {
        console.error(error);
    });
