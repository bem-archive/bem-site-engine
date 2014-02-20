module.exports = {
    get: function() {
        return {
            title: "bem-tools",
            route: {
                conditions: {
                    lib: "bem-tools"
                }
            },
            source: {
                en: {
                    title: "Tools overview",
                    createDate: "17-10-2012",
                    editDate: "",
                    summary: "Short description of bem-tools.",
                    thumbnail: "",
                    authors: ["harisov-vitaly"],
                    tags: ["tools","bem-tools"],
                    translators: [],
                    content: "https://github.com/bem/bem-tools/tree/dev/docs/index/index.en.md"
                },
                ru: {
                    title: "bem-tools",
                    createDate: "17-10-2012",
                    editDate: "",
                    summary: "bem-tools краткое описание.",
                    thumbnail: "",
                    authors: ["harisov-vitaly"],
                    tags: ["tools","bem-tools"],
                    translators: [],
                    content: "https://github.com/bem/bem-tools/tree/dev/docs/index/index.ru.md"
                }
            },
            items: [
                getInstallation(),
                getCommands(),
                getLevels(),
                getDependencies(),
                getCustomization(),
                getTechModules(),
                getApiUsage(),
                getCreatingSubcommands(),
                getContribute()
            ]
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
                id: "installation"
            }
        },
        source: {
            en: {
                title: "Installation",
                longTitle: "Installation of bem-tools",
                createDate: "03-10-2012",
                editDate: "02-07-2013",
                summary: "bem-tools installation manual.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["tools","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/installation/installation.en.md"
            },
            ru: {
                title: "Установка",
                longTitle: "Установка bem-tools",
                createDate: "03-10-2012",
                editDate: "02-08-2013",
                summary: "Инструкция по установке bem-tools.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["tools","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/installation/installation.ru.md"
            }
        }
    };
};

var getCommands = function() {
    return {
        title: {
            en: "Commands",
            ru: "Команды"
        },
        route: {
            conditions: {
                id: "commands"
            }
        },
        source: {
            en: {
                title: "Commands",
                createDate: "19-10-2012",
                editDate: "",
                summary: "The main bem-tools commands.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["tools","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/commands/commands.en.md"
            },
            ru: {
                title: "Команды",
                createDate: "19-10-2012",
                editDate: "",
                summary: "Описание основных команд bem-tools.",
                thumbnail: "",
                authors: ["jetpyspayeva-yelena"],
                tags: ["tools","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/commands/commands.ru.md"
            }
        }
    }
};

var getLevels = function() {
    return {
        title: {
            en: "Levels",
            ru: "Уровни переопределения"
        },
        route: {
            conditions: {
                id: "levels"
            }
        },
        source: {
            en: {
                title: "Levels",
                createDate: "03-10-2012",
                editDate: "",
                summary: "Description of the level .bem/level.js.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["bem-tools","tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/levels/levels.en.md"
            },
            ru: {
                title: "Уровни переопределения",
                createDate: "03-10-2012",
                editDate: "",
                summary: "Описание уровеня переопределения .bem/level.js.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["bem-tools","tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/levels/levels.ru.md"
            }
        }
    }
};

var getDependencies = function() {
    return {
        title: {
            en: "Dependencies",
            ru: "Зависимости"
        },
        route: {
            conditions: {
                id: "depsjs"
            }
        },
        source: {
            en: {
                title: "Dependences",
                createDate: "27-08-2013",
                editDate: "",
                summary: "deps.js — a technology to declare dependencies in BEM",
                thumbnail: "",
                authors: ["bashinsky-pavel"],
                tags: ["bem-tools","tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/depsjs/depsjs.en.md"
            },
            ru: {
                title: "Зависимости",
                createDate: "27-08-2013",
                editDate: "",
                summary: "deps.js — технология для декларирования зависимостей по БЭМ",
                thumbnail: "",
                authors: ["bashinsky-pavel"],
                tags: ["bem-tools","tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/depsjs/depsjs.ru.md"
            }
        }
    }
};

var getCustomization = function() {
    return {
        title: {
            en: "Customization",
            ru: "Настройка"
        },
        route: {
            conditions: {
                id: "customization"
            }
        },
        source: {
            en: {
                title: "Сustomization",
                createDate: "03-10-2012",
                editDate: "",
                summary: "Description of the build customization.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["tools","bem-tools"],
                translators: ["varankin-vladimir"],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/customization/customization.en.md"
            },
            ru: {
                title: "Настройка",
                createDate: "03-10-2012",
                editDate: "",
                summary: "Описание кастомизации сборки.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["tools","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/customization/customization.ru.md"
            }
        }
    }
};

var getTechModules = function() {
    return {
        title: {
            en: "Tech Modules",
            ru: "Модули технологий"
        },
        route: {
            conditions: {
                id: "tech-modules"
            }
        },
        source: {
            en: {
                title: "Tech Modules",
                createDate: "03-10-2012",
                editDate: "23-12-2012",
                summary: "Several ways to create a tech module.",
                thumbnail: "",
                authors: ["ivanichenko-sergey"],
                tags: ["bem-tools","tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/tech-modules/tech-modules.en.md"
            },
            ru: {
                title: "Модули технологий",
                createDate: "03-10-2012",
                editDate: "30-11-2013",
                summary: "Способы создания модуля технологии.",
                thumbnail: "",
                authors: ["ivanichenko-sergey"],
                tags: ["bem-tools","tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/tech-modules/tech-modules.ru.md"
            }
        }
    }
};

var getApiUsage = function() {
    return {
        title: {
            en: "API usage",
            ru: "Использование через API"
        },
        route: {
            conditions: {
                id: "api"
            }
        },
        source: {
            en: {
                title: "API usage",
                createDate: "03-10-2012",
                editDate: "",
                summary: "The document explains how use bem-tools from API.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["tools","bem-tools", "API"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/api/api.en.md"
            },
            ru: {
                title: "Использование через API",
                createDate: "03-10-2012",
                editDate: "",
                summary: "Использование команды bem-tools через API.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["tools","bem-tools", "API"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/api/api.ru.md"
            }
        }
    }
};

var getCreatingSubcommands = function() {
    return {
        title: {
            en: "Creating subcommands",
            ru: "Создание подкоманд"
        },
        route: {
            conditions: {
                id: "creating-subcommands"
            }
        },
        source: {
            en: {
                title: "Creating subcommands",
                createDate: "05-09-2013",
                editDate: "",
                summary: "Starting from `bem-tools 1.0.0` it is possible to extend standard set of commands with subcommands modules.",
                thumbnail: "",
                authors: ["tatarincev-sergej"],
                tags: ["bem-tools","tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/creating-subcommands/creating-subcommands.en.md"
            },
            ru: {
                title: "Создание подкоманд",
                createDate: "05-09-2013",
                editDate: "",
                summary: "Начиная с версии `bem-tools` `1.0.0` cтандартный набор команд можно расширить при помощи модулей подкоманд.",
                thumbnail: "",
                authors: ["tatarincev-sergej"],
                tags: ["bem-tools","tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/creating-subcommands/creating-subcommands.ru.md"
            }
        }
    }
};

var getContribute = function() {
    return {
        title: {
            en: "Contribute to development",
            ru: "Участие в разработке"
        },
        route: {
            conditions: {
                id: "contribute"
            }
        },
        source: {
            en: {
                title: "Contribute to development",
                createDate: "03-10-2012",
                editDate: "",
                summary: "Information about autotests execution.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["tools","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/contribute/contribute.en.md"
            },
            ru: {
                title: "Участие в разработке",
                createDate: "03-10-2012",
                editDate: "",
                summary: "Информация о запуске автотестов.",
                thumbnail: "",
                authors: ["alaev-vladimir"],
                tags: ["tools","bem-tools"],
                translators: [],
                content: "https://github.com/bem/bem-tools/tree/dev/docs/contribute/contribute.ru.md"
            }
        }
    }
};
