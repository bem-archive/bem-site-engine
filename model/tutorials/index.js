var tutorials = require('./tutorials');

module.exports = {
    get: function() {
        return {
            title: {
                en: "Tutorials",
                ru: "Учебные материалы"
            },
            route: {
                name: "tutorials",
                pattern: "/tutorials(/<tutorial>)(/<category>)(/<id>)(/)"
            },
            source: {
                en: {
                    title: "Tutorials",
                    createDate: "04-02-2014",
                    editDate: "",
                    summary: "Tutorials for BEM methodology.",
                    thumbnail: "",
                    authors: ["stepanova-varvara"],
                    tags: ["BEM"],
                    translators: ["stepanova-varvara"],
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/index/index.en.md"
                },
                ru: {
                    title: "Туториалы",
                    createDate: "04-02-2014",
                    editDate: "",
                    summary: "Предисловие к туториалам.",
                    thumbnail: "",
                    authors: ["stepanova-varvara"],
                    tags: ["BEM"],
                    translators: [],
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/index/index.ru.md"
                }
            },
            items: [
                tutorials.get()
            ]
        };
    }
};
