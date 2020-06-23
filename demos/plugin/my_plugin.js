'use strict';

module.exports = {
    classGroups: [
        function () {
            return {
                'MyPlugin': function () {
                    function MyPlugin() {}

                    MyPlugin.prototype.myMethod = function (message) {
                        console.log(message);
                    };

                    return MyPlugin;
                }
            };
        }
    ]
};
