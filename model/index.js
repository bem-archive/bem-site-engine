var method = require('./method');

module.exports = {
    get: function() {
        return [
            {
                title: {
                    en: "BEM. Block, Element, Modifier",
                    ru: "БЭМ. Блок, Элемент, Модификатор"
                },
                route: {
                    name: "index",
                    pattern: "/"
                },
                view: "index"
            },
            method.get()
        ]
    }
};