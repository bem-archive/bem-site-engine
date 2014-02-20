var bemhtml = require('./bemhtml'),
    iBemJs = require('./i-bem-js');

module.exports = {
    get: function() {
        return {
            title: "1.1.0",
            route: {
                conditions: {
                    version: "1.1.0"
                }
            },
            source: {
                en: {
                    title: "bem-core library",
                    createDate: "25-12-2013",
                    editDate: "",
                    summary: "bem-core is a base library for web interface development. It provides the minimal stack for coding client-side JavaScript and templating.",
                    thumbnail: "",
                    authors: ["berezhnoy-sergey"],
                    tags: ["bem-core"],
                    translators: ["stepanova-varvara"],
                    content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/bem-core/bem-core.en.md"
                },
                ru: {
                    title: "Библиотека bem-core",
                    createDate: "25-12-2013",
                    editDate: "25-12-2013",
                    summary: "bem-core это базовая библиотека блоков для разработки веб-интерфейсов. Содержит только необходимый минимум для разработки клиентского js и html-шаблонов.",
                    thumbnail: "",
                    authors: ["berezhnoy-sergey"],
                    tags: ["bem-core"],
                    translators: [],
                    content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/bem-core/bem-core.ru.md"
                }
            },
            items: [
                getChangelog(),
                getMigration(),
                bemhtml.get(),
                iBemJs.get()
            ]
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
                longTitle: "bem-core: Changelog",
                createDate: "25-12-2013",
                editDate: "",
                summary: "The history of bem-core changes.",
                thumbnail: "",
                authors: ["berezhnoy-sergey","filatov-dmitry"],
                tags: ["bem-core"],
                translators: [],
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/changelog/changelog.en.md"
            },
            ru: {
                title: "История изменений",
                longTitle: "bem-core: история изменений",
                createDate: "25-12-2013",
                editDate: "",
                summary: "История изменений.",
                thumbnail: "",
                authors: ["berezhnoy-sergey","filatov-dmitry"],
                tags: ["bem-core"],
                translators: [],
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/changelog/changelog.ru.md"
            }
        }
    }
};

var getMigration = function() {
    return {
        title: {
            en: "Migration",
            ru: "Миграция"
        },
        route: {
            conditions: {
                id: "migration"
            }
        },
        source: {
            en: {
                title: "Migration",
                longTitle: "bem-core: Migration",
                createDate: "26-08-2013",
                editDate: "",
                summary: "Migration to bem-core.",
                thumbnail: "",
                authors: ["filatov-dmitry"],
                tags: ["bem-core","i-bem"],
                translators: ["stepanova-varvara"],
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/migration/migration.en.md"
            },
            ru: {
                title: "Миграция",
                longTitle:  "bem-core: Миграция",
                createDate: "04-08-2013",
                editDate: "21-06-2013",
                summary: "Миграция на bem-core.",
                thumbnail: "",
                authors: ["filatov-dmitry"],
                tags: ["bem-core"],
                translators: [],
                content: "https://github.com/tormozz48/bem-core/tree/b1.1.0/common.docs/migration/migration.ru.md"
            }
        }
    }
};
