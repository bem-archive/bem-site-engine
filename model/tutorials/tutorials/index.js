var bemJsTutorial = require('./bem-js-tutorial');

module.exports = {
    get: function() {
        return {
            title: {
                en: "Tutorials",
                ru: "Руководства"
            },
            route: {
                conditions: {
                    tutorial: "articles"
                }
            },
            type: "group",
            items: [
                bemJsTutorial.get()
            ]
        };
    }
};
