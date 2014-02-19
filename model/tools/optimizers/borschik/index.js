module.exports = {
    get: function() {
        return {
            title: "borschik",
            route: {
                conditions: {
                    lib: "borschik"
                }
            },
            source: {
                en: {
                    title: "borschik",
                    createDate: "29-06-2013",
                    editDate: "15-08-2013",
                    summary: "A short guide to borschik.",
                    thumbnail: "",
                    authors: ["androsov-alexey"],
                    tags: ["tools", "borschik"],
                    translators: [],
                    type: "tools",
                    content: "https://github.com/bem/borschik/tree/master/docs/index/index.en.md"
                },
                ru: {
                    title: "borschik",
                    createDate: "29-06-2013",
                    editDate: "15-08-2013",
                    summary: "Инструкция по использованию borschik.",
                    thumbnail: "",
                    authors: ["androsov-alexey"],
                    tags: ["tools", "borschik"],
                    translators: [],
                    type: "tools",
                    content: "https://github.com/bem/borschik/tree/master/docs/index/index.ru.md"
                }
            },
            items: [
                getFreeze(),
                getWhereIsMyTech(),
                getborschikServer(),
                getChangelog(),
                getJsInclude()
            ]
        }
    }
};

var getFreeze = function() {
    return {
        title: {
            en: "Static resources \"freeze\"",
            ru: "\"Заморозка\" статических ресурсов (freeze)"
        },
        route: {
            conditions: {
                id: "freeze"
            }
        },
        source: {
            en: {
                title: "Static resources \"freeze\"",
                createDate: "09-09-2013",
                editDate: "14-09-2013",
                summary: "borschik technique for static resource loading.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik/tree/master/docs/freeze/freeze.en.md"
            },
            ru: {
                title: "\"Заморозка\" статических ресурсов(freeze)",
                longTitle: "\"Заморозка\" статических ресурсов(freeze) предлагаемая borschik",
                createDate: "09-09-2013",
                editDate: "14-09-2013",
                summary: "\"freeze\" - способ оптимизации загрузки статики предлагаемый borschik.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik/tree/master/docs/freeze/freeze.ru.md"
            }
        }
    }
};

var getWhereIsMyTech = function() {
    return {
        title: {
            en: "Where Is My Tech",
            ru: "borschik и технологии"
        },
        route: {
            conditions: {
                id: "where-is-my-tech"
            }
        },
        source: {
            en: {
                title: "Where Is My Tech",
                createDate: "02-10-2013",
                editDate: "",
                summary: "How borschik resolves technologies.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik/tree/master/docs/where-is-my-tech/where-is-my-tech.en.md"
            },
            ru: {
                title: "borschik и технологии",
                longTitle: "Как borschik собирает технологии",
                createDate: "02-10-2013",
                editDate: "",
                summary: "Как borschik собирает технологии.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik/tree/master/docs/where-is-my-tech/where-is-my-tech.ru.md"
            }
        }
    }
};

var getborschikServer = function() {
    return {
        title: "borschik-server",
        route: {
            conditions: {
                id: "borschik-server"
            }
        },
        source: {
            en: {
                title: "borschik-server",
                createDate: "02-08-2013",
                editDate: "19-08-2013",
                summary: "Short description of borschik-server.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik-server/tree/master/docs/borschik-server/borschik-server.en.md"
            },
            ru: {
                title: "borschik-server",
                createDate: "14-08-2013",
                editDate: "",
                summary: "Краткое описание borschik-server.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik-server/tree/master/docs/borschik-server/borschik-server.ru.md"
            }
        }
    }
};

var getChangelog = function() {
    return {
        title: {
            en: "Changelog",
            ru: "История изменений"
        },
        route: {
            conditions: {
                id: "changelog"
            }
        },
        source: {
            en: {
                title: "Changelog",
                longTitle: "borschik Changelog",
                createDate: "06-07-2013",
                editDate: "08-10-2013",
                summary: "borschik changelog.",
                thumbnail: "",
                authors: ["androsov-alexey", "belov-sergey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik/tree/master/docs/changelog/changelog.en.md"
            },
            ru: {
                title: "Changelog",
                longTitle: "borschik Changelog",
                createDate: "06-07-2013",
                editDate: "08-10-2013",
                summary: "borschik changelog.",
                thumbnail: "",
                authors: ["androsov-alexey", "belov-sergey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik/tree/master/docs/changelog/changelog.ru.md"
            }
        }
    }
};

var getJsInclude = function() {
    return {
        title: {
            en: "JS Include Notations",
            ru: "Нотация для JS include"
        },
        route: {
            conditions: {
                id: "js-include"
            }
        },
        source: {
            en: {
                title: "JS Include Notations",
                createDate: "08-09-2013",
                editDate: "",
                summary: "borschik can merge JS files. But there is no standard method for this in Javascript so borschik uses the syntax described in this article.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik/tree/master/docs/js-include/js-include.en.md"
            },
            ru: {
                title: "Нотация для JS include",
                createDate: "08-09-2013",
                editDate: "",
                summary: "borschik может объединять JS файлы, однако для этого в JavaScript не существует стандартных методов. Данная статья описывает синтаксис JS include для borschik.",
                thumbnail: "",
                authors: ["androsov-alexey"],
                tags: ["tools", "borschik"],
                translators: [],
                type: "tools",
                content: "https://github.com/bem/borschik/tree/master/docs/js-include/js-include.ru.md"
            }
        }
    }
};
