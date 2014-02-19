module.exports = {
    get: function() {
        return {
            title: {
                en: "Methodology",
                ru: "Методология"
            },
            route: {
                name: "method",
                pattern: "/method(/<id>)(/)"
            },
            source: {
                en: {
                    "title": "Methodology",
                    "createDate": "02-10-2012",
                    "editDate": "15-06-2012",
                    "summary": "Foreword to BEM methodology.",
                    "thumbnail": "",
                    "authors": ["harisov-vitaly"],
                    "tags": ["BEM"],
                    "translators": ["belov-sergey"],
                    "content": "https://github.com/bem/bem-method/tree/bem-info-data/method/index/index.en.md"
                },
                ru: {
                    title: "Методология",
                    createDate: "26-09-2012",
                    editDate: "17-10-2012",
                    summary: "Предисловие к БЭМ методологии.",
                    thumbnail: "",
                    authors: ["harisov-vitaly"],
                    tags: ["BEM"],
                    translators: [],
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/method/index/index.en.md"
                }
            },
            items: [
                getDefinitions(),
                getFileSystem(),
                getHistory()
            ]
        }
    }
};

var getDefinitions = function() {
    return {
        title: {
            en: "Definitions",
            ru: "Определения"
        },
        route: {
            conditions: {
                id: "definitions"
            }
        },
        source: {
            en: {
                title: "Definitions",
                createDate: "03-10-2012",
                editDate: "06-08-2013",
                summary: "Definitions of BEM methodology.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["BEM"],
                translators: ["grinenko-vladimir"],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/method/definitions/definitions.en.md"
            },
            ru: {
                title: "Определения",
                createDate: "03-10-2012",
                editDate: "06-08-2013",
                summary: "Определения БЭМ методологии.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/method/definitions/definitions.ru.md"
            }
        }
    };
};

var getFileSystem = function() {
    return {
        title: {
            en: "Filesystem",
            ru: "Организация файловой системы"
        },
        route: {
            conditions: {
                id: "filesystem"
            }
        },
        source: {
            en: {
                title: "Filesystem",
                createDate: "02-10-2012",
                editDate: "06-08-2013",
                summary: "Filesystem according to BEM methodology.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["BEM"],
                translators: ["belov-sergey"],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/method/filesystem/filesystem.en.md"
            },
            ru: {
                title: "Организация файловой системы",
                createDate: "01-10-2012",
                editDate: "06-08-2013",
                summary: "Организация файловой системы согласно БЭМ-методологии.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/method/filesystem/filesystem.ru.md"
            }
        }
    };
};

var getHistory = function() {
    return {
        title: {
            en: "History",
            ru: "История создания"
        },
        route: {
            conditions: {
                id: "history"
            }
        },
        source: {
            en: {
                title: "History",
                createDate: "02-10-2012",
                editDate: "06-06-2013",
                summary: "The history of BEM.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/method/history/history.en.md"
            },
            ru: {
                title: "История создания",
                createDate: "26-09-2012",
                editDate: "06-06-2013",
                summary: "История создания БЭМ.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["BEM"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/method/history/history.ru.md"
            }
        }
    };
};
