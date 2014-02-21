var method = require('./method'),
    tools = require('./tools'),
    libraries = require('./libraries'),
    tutorials = require('./tutorials'),
    articles = require('./articles'),
    news = require('./news'),
    pages = require('./pages');

module.exports = {
    get: function() {
        return [
            getMain(),
            method.get(),
            tools.get(),
            libraries.get(),

            getDelimeter(),

            tutorials.get(),
            articles.get(),
            news.get(),
            getTags(),
            getAuthors(),
            pages.jobs.get(),

            getDelimeter(),

            getYaRu(),
            getFacebook(),
            getTwitter(),
            pages.acknowledgements.get()
        ]
    }
};

/**
 * Return main page section
 * @returns {{title: {en: string, ru: string}, route: {name: string, pattern: string}, view: string}}
 */
var getMain = function() {
        return {
            title: {
                en: "BEM. Block, Element, Modifier",
                    ru: "БЭМ. Блок, Элемент, Модификатор"
            },
            route: {
                name: "index",
                    pattern: "/"
            },
            view: "index"
        }
    },

    /**
     * Returns authors section
     * @returns {{title: {en: string, ru: string}, route: {name: string, pattern: string}, view: string, items: *[]}}
     */
    getAuthors = function() {
        return {
            title: {
                en: "Authors",
                ru: "Авторы"
            },
            route:{
                name: "authors",
                pattern: "/authors(/<id>)(/)"
            },
            view: "authors",
            items: [
                {
                    title: {
                        en: "AUTHORS",
                        ru: "АВТОРЫ"
                    },
                    dynamic: "authors"
                },
                {
                    title: {
                        en: "TRANSLATORS",
                        ru: "ПЕРЕВОДЧИКИ"
                    },
                    dynamic: "translators"
                }
            ]
        };
    },

    /**
     * Returns tags section
     * @returns {{title: {en: string, ru: string}, route: {name: string, pattern: string}, view: string, source: string, items: *[]}}
     */
    getTags = function() {
        return {
            title: {
                en: "Tags",
                ru: "Теги"
            },
            route:{
                name: "tags",
                pattern: "/tags(/<id>)(/)"
            },
            view: "tags",
            source: "https://github.com/bem/bem-method/tree/bem-info-data/pages/dummy",
            items: [
                {
                    title: {
                        en: "TAGS",
                        ru: "ТЕГИ"
                    },
                    dynamic: "tags"
                }
            ]
        };
    },

    /**
     * Returns outer ya ru link
     * @returns {{title: {ru: string}, url: string, size: string, hidden: string[]}}
     */
    getYaRu = function() {
        return {
            title: {
                ru: "Я.ру"
            },
            url: "http://clubs.ya.ru/bem/",
            size: "small",
            hidden: ["en"]
        };
    },

    /**
     * Returns outer facebook link
     * @returns {{title: string, url: string, size: string}}
     */
    getFacebook = function() {
        return {
            title: "Facebook",
            url: "http://www.facebook.com/#!/groups/209713935765634/",
            size: "small"
        };
    },

    /**
     * Return outer twitter link
     * @returns {{title: string, url: {en: string, ru: string}, size: string}}
     */
    getTwitter  = function() {
        return {
            title: "Twitter",
            url: {
                en: "https://twitter.com/bem_en",
                ru: "https://twitter.com/bem_ru"
            },
            size: "small"
        };
    },

    /**
     * Returns delimeter
     * @returns {{type: string}}
     */
    getDelimeter = function() {
        return {
            type: "delimeter"
        };
    };
