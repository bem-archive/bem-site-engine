var bem = require('./bem'),
    optimizers = require('./optimizers'),
    templatingEngines = require('./templatingEngines'),
    parsers = require('./parsers');

module.exports = {
    get: function() {
        return {
            title: {
                en: "Tools",
                ru: "Инструменты"
            },
            route: {
                name: "tools",
                pattern: "/tools(/<group>)(/<lib>)(/<id>)(/)"
            },
            source: {
                en: {
                    title: "Libs Overview",
                    createDate: "16-01-2014",
                    editDate: "",
                    summary: "",
                    thumbnail: "",
                    authors: ["grinenko-vladimir"],
                    tags: ["libs"],
                    translators: [],
                    type: "libs",
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/tools/index/index.en.md"
                },
                ru: {
                    title: "Краткий обзор библиотек",
                    createDate: "16-01-2014",
                    editDate: "",
                    summary: "",
                    thumbnail: "",
                    authors: ["grinenko-vladimir"],
                    tags: ["libs"],
                    translators: [],
                    type: "libs",
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/tools/index.ru.md"
                }
            },
            items: [
                bem.get(),
                optimizers.get(),
                templatingEngines.get(),
                parsers.get()
            ]
        };
    }
};
