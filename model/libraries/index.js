var bemCore = require('./bem-core');

module.exports = {
    get: function() {
        return {
            title: {
                en: "Libraries",
                ru: "Библиотеки"
            },
            route: {
                name: "libs",
                pattern: "/libs(/<lib>)(/<version>)(/<level>)(/<block>)(/<id>)(/)"
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
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/libs/index/index.en.md"
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
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/libs/index/index.ru.md"
                }
            },
            items: [
                bemCore.get()
            ]
        };
    }
};
