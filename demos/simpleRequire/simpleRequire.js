'use strict';

require('../../register')()
    .then(function () {
        return require('./print27.php')().execute();
    })
    .catch(function (error) {
        console.error(error);
    });
