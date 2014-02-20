var v100 = require('./1.0.0'),
    v110 = require('./1.1.0');

module.exports = {
    get: function() {
        return {
            title: "bem-core",
            route: {
                conditions: {
                    lib: "bem-core"
                }
            },
            type: "group",
            items: [
                v100.get(),
                v110.get()
            ]
        }
    }
};
