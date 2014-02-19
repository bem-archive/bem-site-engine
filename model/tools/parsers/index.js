module.exports = {
    get: function() {
        return {
            title: {
                en: "Parsers",
                ru: "Парсеры"
            },
            route: {
                conditions: {
                    group: "parsers"
                }
            },
            type: "group",
            items: [
                getGonzales()
            ]
        }
    }
};

var getGonzales = function() {
    return {
        title: "gonzales",
        route: {
            conditions: {
                lib: "gonzales"
            }
        },
        source: {
            en: {
                title: "gonzales",
                createDate: "03-10-2012",
                editDate: "",
                summary: "Gonzales is fast CSS parser.",
                thumbnail: "http://soulshine.in/svgo.svg",
                authors: ["kryzhanovsky-sergey"],
                tags: ["tools", "css"],
                translators: [""],
                type: "tools",
                content: "https://github.com/lesanra/gonzales/tree/bem-info-data/doc/gonzales/gonzales.en.md"
            },
            ru: {
                title: "gonzales",
                createDate: "03-10-2012",
                editDate: "",
                summary: "Gonzales — быстрый парсер CSS.",
                thumbnail: "http://soulshine.in/svgo.svg",
                authors: ["kryzhanovsky-sergey"],
                tags: ["tools", "css"],
                translators: [""],
                type: "tools",
                content: "https://github.com/lesanra/gonzales/tree/bem-info-data/doc/gonzales/gonzales.ru.md"
            }
        }
    }
};
