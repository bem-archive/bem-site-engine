module.exports = {
    get: function() {
        return {
            title: "CSSO",
            route: {
                conditions: {
                    lib: "csso"
                }
            },
            source: {
                en: {
                    title: "CSSO",
                    createDate: "17-11-2012",
                    editDate: "",
                    summary: "Short introduction to CSSO.",
                    thumbnail: "",
                    authors: ["harisov-vitaly"],
                    tags: ["tools", "css"],
                    translators: ["khachaturov-leonid"],
                    type: "tools",
                    content: "https://github.com/css/csso/tree/master/docs/index/index.en.md"
                },
                ru: {
                    title: "CSSO",
                    createDate: "17-10-2012",
                    editDate: "28-10-2012",
                    summary: "Краткое введение в CSSO.",
                    thumbnail: "",
                    authors: ["harisov-vitaly"],
                    tags: ["tools", "css"],
                    translators: [],
                    type: "tools",
                    content: "https://github.com/css/csso/tree/master/docs/index/index.ru.md"
                }
            },
            items: [
                getDescription(),
                getInstallation(),
                getUsage()
            ]
        }
    }
};

var getDescription = function() {
    return {
        title: {
            en: "Description",
            ru: "Описание"
        },
        route: {
            conditions: {
                id: "description"
            }
        },
        source: {
            en: {
                title: "Description of CSSO",
                createDate: "17-10-2012",
                editDate: "28-10-2012",
                summary: "CSSO (CSS Optimizer) is a CSS minimizer unlike others. In addition to usual minification techniques it can perform structural optimization of CSS files, resulting in smaller file size compared to other minifiers.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["tools", "css"],
                translators: [],
                type: "tools",
                content: "https://github.com/css/csso/tree/master/docs/description/description.en.md"
            },
            ru: {
                title: "Описание CSSO",
                createDate: "17-10-2012",
                editDate: "28-10-2012",
                summary: "CSSO (CSS Optimizer) является минимизатором CSS, выполняющим как минимизацию без изменения структуры, так и структурную минимизацию с целью получить как можно меньший текст.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["tools", "css"],
                translators: [],
                type: "tools",
                content: "https://github.com/css/csso/tree/master/docs/description/description.ru.md"
            }
        }
    }
};

var getInstallation = function() {
    return {
        title: {
            en: "Installation",
            ru: "Установка"
        },
        route: {
            conditions: {
                id: "install"
            }
        },
        source: {
            en: {
                title: "CSSO Installation",
                createDate: "17-10-2012",
                editDate: "",
                summary: "CSSO installation manual.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["tools", "css"],
                translators: ["khachaturov-leonid"],
                type: "tools",
                content: "https://github.com/css/csso/tree/master/docs/install/install.en.md"
            },
            ru: {
                title: "Установка CSSO",
                createDate: "17-10-2012",
                editDate: "",
                summary: "Инструкция по установке CSSO.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["tools", "css"],
                translators: [],
                type: "tools",
                content: "https://github.com/css/csso/tree/master/docs/install/install.ru.md"
            }
        }
    }
};

var getUsage = function() {
    return {
        title: {
            en: "Usage",
            ru: "Использование"
        },
        route: {
            conditions: {
                id: "usage"
            }
        },
        source: {
            en: {
                title: "CSSO Usage",
                createDate: "17-10-2012",
                editDate: "28-10-2012",
                summary: "Usage of CSSO.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["tools", "css"],
                translators: ["khachaturov-leonid"],
                type: "tools",
                content: "https://github.com/css/csso/tree/master/docs/usage/usage.en.md"
            },
            ru: {
                title: "Использование CSSO",
                createDate: "17-10-2012",
                editDate: "28-10-2012",
                summary: "Использование CSSO.",
                thumbnail: "",
                authors: ["harisov-vitaly"],
                tags: ["tools", "css"],
                translators: [],
                type: "tools",
                content: "https://github.com/css/csso/tree/master/docs/usage/usage.ru.md"
            }
        }
    }
};
