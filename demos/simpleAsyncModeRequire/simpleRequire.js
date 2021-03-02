'use strict';

require('../../register')(__dirname)
    .then(function () {
        return require('./print27.php')().execute();
    })
    .catch(function (error) {
        console.error(error);
    });
