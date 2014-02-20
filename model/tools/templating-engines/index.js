var bemhtml = require('./bemhtml'),
    xjst = require('./xjst');

module.exports = {
    get: function() {
        return {
            title: {
                en: "Templating engines",
                ru: "Шаблонизаторы"
            },
            route: {
                conditions: {
                    group: "templating-engines"
                }
            },
            type: "group",
            items: [
                bemhtml.get(),
                xjst.get()
            ]
        };
    }
};
