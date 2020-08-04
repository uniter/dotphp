'use strict';

module.exports = {
    bindingGroups: [
        function () {
            return {
                /*
                 * Bindings are used to share logic between addons within the same environment.
                 * Create a fake binding here that is just a simple POJO with a "myExtractedOption" prop -
                 * its value should be automatically extracted from config (uniter.config.js)
                 * to be passed through here.
                 */
                myBinding: function (bindingOptions) {
                    return {
                        myExtractedOption: bindingOptions.myOption
                    };
                }
            };
        }
    ],
    classGroups: [
        function () {
            return {
                'MyAddon': function (internals) {
                    function MyAddon() {}

                    MyAddon.prototype.myMethod = function (message) {
                        console.log(message);

                        console.log('Binding option: ' + internals.getBinding('myBinding').myExtractedOption);
                    };

                    return MyAddon;
                }
            };
        }
    ]
};
