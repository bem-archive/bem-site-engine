var method = require('./method'),
    tools = require('./tools'),
    libraries = require('./libraries'),
    tutorials = require('./tutorials'),
    articles = require('./articles'),
    news = require('./news');

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
            method.get(),
            tools.get(),
            libraries.get(),
            tutorials.get(),
            articles.get(),
            news.get()
        ]
    }
};