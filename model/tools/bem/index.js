var bemTools = require('./bem-tools');

module.exports = {
    get: function() {
        return {
            title: "bem",
            route: {
                conditions: {
                    group: "bem"
                }
            },
            type: "group",
            items: [
                bemTools.get()
            ]
        };
    }
};
