module.exports = {
    get: function() {
        return {
            title: "BEMHTML",
            route: {
                conditions: {
                    lib: "BEMHTML"
                }
            },
            items: [
                getReference100(),
                getReference110(),
                getRationale100(),
                getRationale110()
            ]
        }
    }
};

var getReference100 = function() {
    return {
        title: {
            en: "BEMHTML-Reference",
            ru: "Референс по BEMHTML"
        },
        url: "/libs/bem-core/1.0.0/reference/#",
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
                content: "https://github.com/tormozz48/bem-core/tree/b1.0.0/common.docs/reference/reference.en.md"
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
                content: "https://github.com/tormozz48/bem-core/tree/b1.0.0/common.docs/reference/reference.ru.md"
            }
        }
    }
};

var getReference110 = function() {
    return {
        title: {
            en: "BEMHTML-Reference",
            ru: "Референс по BEMHTML"
        },
        url: "/libs/bem-core/1.1.0/reference/#",
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
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/reference/reference.ru.md"
            }
        }
    }
};

var getRationale100 = function() {
    return {
        title: {
            en: "BEMHTML: Template Engine for BEM",
            ru: "BEMHTML: шаблонизатор для БЭМ"
        },
        url: "/libs/bem-core/1.0.0/rationale/#",
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
                content: "https://github.com/tormozz48/bem-core/tree/b1.0.0/common.docs/rationale/rationale.en.md"
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
                content: "https://github.com/tormozz48/bem-core/tree/b1.0.0/common.docs/rationale/rationale.ru.md"
            }
        }
    }
};

var getRationale110 = function() {
    return {
        title: {
            en: "BEMHTML: Template Engine for BEM",
            ru: "BEMHTML: шаблонизатор для БЭМ"
        },
        url: "/libs/bem-core/1.1.0/rationale/#",
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
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/rationale/rationale.ru.md"
            }
        }
    }
};
