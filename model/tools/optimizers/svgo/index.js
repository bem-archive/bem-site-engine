module.exports = {
    get: function() {
        return {
            title: "SVGO",
            route: {
                conditions: {
                    lib: "svgo"
                }
            },
            items: [
                getHowItWorks(),
                getSvgo()
            ]
        }
    }
};

var getHowItWorks = function() {
    return {
        title: {
            en: "How SVGO Works",
            ru: "Как работает SVGO"
        },
        route: {
            conditions: {
                id: "how-it-works"
            }
        },
        source: {
            en: {
                title: "How SVGO Works",
                createDate: "04-12-2012",
                editDate: "12-04-2013",
                summary: "An exciting story about how SVG Optimizer works.",
                thumbnail: "",
                authors: ["belevich-kir"],
                tags: ["tools"],
                translators: [],
                type: "tools",
                content: "https://github.com/svg/svgo/tree/beminfo/docs/how-it-works/how-it-works.en.md"
            },
            ru: {
                title: "Как работает SVGO",
                createDate: "04-12-2012",
                editDate: "12-04-2013",
                summary: "Увлекательный рассказ о том как работает SVGO.",
                thumbnail: "",
                authors: ["belevich-kir"],
                tags: ["tools"],
                translators: [],
                type: "tools",
                content: "https://github.com/svg/svgo/tree/beminfo/docs/how-it-works/how-it-works.ru.md"
            }
        }
    }
};

var getSvgo = function() {
    return {
        title: "SVG Optimizer",
        route: {
            conditions: {
                id: "svgo"
            }
        },
        source: {
            en: {
                title: "SVG Optimizer",
                createDate: "23-11-2012",
                editDate: "24-06-2013",
                summary: "SVG Optimizer is a NodeJS-based tool for optimizing SVG vector graphics files.",
                thumbnail: "http://soulshine.in/svgo.svg",
                authors: ["belevich-kir"],
                tags: ["tools"],
                translators: [],
                type: "tools",
                content: "https://github.com/svg/svgo/tree/beminfo/docs/svgo/svgo.en.md"
            },
            ru: {
                title: "SVG Optimizer",
                createDate: "03-12-2012",
                editDate: "24-06-2013",
                summary: "SVG Optimizer  — это инструмент для оптимизации векторной графики в формате SVG, написанный на Node.js.",
                thumbnail: "http://soulshine.in/svgo.svg",
                authors: ["belevich-kir"],
                tags: ["tools"],
                translators: [],
                type: "tools",
                content: "https://github.com/svg/svgo/tree/beminfo/docs/svgo/svgo.ru.md"
            }
        }
    }
};
