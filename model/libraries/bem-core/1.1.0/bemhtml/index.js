module.exports = {
    get: function() {
        return {
            title: "bemhtml",
            route: {
                conditions: {
                    level: "bemhtml"
                }
            },
            type: "group",
            items: [
                getIntro(),
                getReference(),
                getRationale()
            ]
        }
    }
};

var getIntro = function() {
    return {
        title: "Hello, BEMHTML!",
        route: {
            conditions: {
                id: "intro"
            }
        },
        source: {
            en: {
                title: "Hello, BEMHTML!",
                createDate: "09-07-2013",
                editDate: "",
                summary: "This guide helps try the BEMHTML Templaiting Engine and understand the basics of working with it in 7 simple steps.",
                thumbnail: "",
                authors: ["maslinsky-kirill"],
                tags: ["BEMHTML"],
                translators: ["nekhaieva-aleksandra"],
                type: "libs",
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/intro/intro.en.md"
            },
            ru: {
                title: "Hello, BEMHTML!",
                createDate: "01-01-2013",
                editDate: "",
                summary: "Руководство рассказывает как попробовать шаблонизатор BEMHTML и понять основные принципы работы с ним, пройдя семь простых шагов.",
                thumbnail: "",
                authors: ["maslinsky-kirill"],
                tags: ["BEMHTML"],
                translators: [],
                type: "libs",
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/intro/intro.ru.md"
            }
        }
    }
};

var getReference = function() {
    return {
        title: {
            en: "BEMHTML-Reference",
            ru: "Референс по BEMHTML"
        },
        source: {
            en: {
                title: "BEMHTML-Reference",
                createDate: "02-09-2013",
                editDate: "29-01-2014",
                summary: "BEMHTML-reference.",
                thumbnail: "",
                authors: ["maslinsky-kirill", "ivanichenko-sergey"],
                tags: ["BEMHTML"],
                translators: ["nekhaieva-aleksandra"],
                type: ["libs", "tools"],
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/reference/reference.en.md"
            },
            ru: {
                title: "Референс по BEMHTML",
                createDate: "06-03-2013",
                editDate: "29-01-2014",
                summary: "Cправочное руководство по шаблонизатору BEMHTML.",
                thumbnail: "",
                authors: ["maslinsky-kirill", "ivanichenko-sergey"],
                tags: ["BEMHTML"],
                translators: [],
                type: ["libs", "tools"],
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/reference/reference.ru.md"
            }
        }
    }
};

var getRationale = function() {
    return {
        title: {
            en: "BEMHTML: Template Engine for BEM",
            ru: "BEMHTML: шаблонизатор для БЭМ"
        },
        source: {
            en: {
                title: "BEMHTML: Template Engine for BEM",
                createDate: "02-09-2013",
                editDate: "",
                summary: "BEMHTML: short overview, capabilities, comparison with other template engines.",
                thumbnail: "",
                authors: ["maslinsky-kirill"],
                tags: ["BEMHTML"],
                translators: ["nekhaieva-aleksandra"],
                type: ["libs", "tools"],
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/rationale/rationale.en.md"
            },
            ru: {
                title: "BEMHTML: шаблонизатор для БЭМ",
                createDate: "02-09-2013",
                editDate: "",
                summary: "BEMHTML: краткая информация, возможности, сравнение с другими шаблонизаторами.",
                thumbnail: "",
                authors: ["maslinsky-kirill"],
                tags: ["BEMHTML"],
                translators: [],
                type: ["libs", "tools"],
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/rationale/rationale.ru.md"
            }
        }
    }
};
