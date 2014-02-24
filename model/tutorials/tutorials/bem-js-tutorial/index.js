module.exports = {
    get: function() {
        return {
            title: {
                en: "Step-by-step tutorial on i-bem.js",
                ru: "Пошаговое руководство по i-bem.js"
            },
            route: {
                conditions: {
                    category: "bem-js-tutorial"
                }
            },
            source: {
                en: {
                    title: "bem-js tutorial",
                    createDate: "04-02-2014",
                    editDate: "",
                    summary: "How to write client side JS using i-bem.js.",
                    thumbnail: "",
                    authors: ["stepanova-varvara"],
                    tags: ["i-bem.js", "JavaScript"],
                    translators: ["stepanova-varvara"],
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/bem-js-tutorial/00-Intro/00-Intro.en.md"
                },
                ru: {
                    title: "bem-js туториал",
                    createDate: "04-02-2014",
                    editDate: "",
                    summary: "Блок i-bem реализован в нескольких технологиях, и одна из них — JavaScript.",
                    thumbnail: "",
                    authors: ["stepanova-varvara"],
                    tags: ["i-bem.js", "JavaScript"],
                    translators: [],
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/bem-js-tutorial/00-Intro/00-Intro.ru.md"
                }
            },
            items: [
                blockStructure(),
                modifiers(),
                liveInit()
            ]
        };
    }
};

var blockStructure = function() {
    return {
        title: {
            en: "Block structure",
            ru: "Структура блока"
        },
        route: {
            conditions: {
                id: "01-block-structure"
            }
        },
        source: {
            en: {
                title: "Block structure",
                createDate: "04-02-2014",
                editDate: "",
                summary: "Any BEM block can be equipped with JavaScript.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["i-bem.js", "JavaScript"],
                translators: ["stepanova-varvara"],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/bem-js-tutorial/01-Block-structure/01-Block-structure.en.md"
            },
            ru: {
                title: "Block structure",
                createDate: "04-02-2014",
                editDate: "",
                summary: "Описание структуры БЭМ блока.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["i-bem.js", "JavaScript"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/bem-js-tutorial/01-Block-structure/01-Block-structure.ru.md"
            }
        }
    }
};

var modifiers = function() {
    return {
        title: {
            en: "Modifiers",
            ru: "Модификаторы"
        },
        route: {
            conditions: {
                id: "02-modifiers"
            }
        },
        source: {
            en: {
                title: "Modifiers",
                createDate: "04-02-2014",
                editDate: "",
                summary: "In BEM, modifiers express block states.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["i-bem.js", "JavaScript"],
                translators: ["stepanova-varvara"],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/bem-js-tutorial/02-Modifiers/02-Modifiers.en.md"
            },
            ru: {
                title: "Модификаторы блока",
                createDate: "04-02-2014",
                editDate: "",
                summary: "В БЭМ модификаторы выражают состояние блока.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["i-bem.js", "JavaScript"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/bem-js-tutorial/02-Modifiers/02-Modifiers.ru.md"
            }
        }
    }
};

var liveInit = function() {
    return {
        title: {
            en: "Live-initialization",
            ru: "Живая (ленивая) инициализация"
        },
        route: {
            conditions: {
                id: "03-live-initialization"
            }
        },
        source: {
            en: {
                title: "Live-initialization",
                createDate: "04-02-2014",
                editDate: "",
                summary: "Before a block starts to function the core initializes it.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["i-bem.js", "JavaScript"],
                translators: ["stepanova-varvara"],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/bem-js-tutorial/03-Live-initialization/03-Live-initialization.en.md"
            },
            ru: {
                title: "Live-инициализация",
                createDate: "04-02-2014",
                editDate: "",
                summary: "Перед началом работы блок инициализируется ядром.",
                thumbnail: "",
                authors: ["stepanova-varvara"],
                tags: ["i-bem.js", "JavaScript"],
                translators: [],
                content: "https://github.com/bem/bem-method/tree/bem-info-data/tutorials/bem-js-tutorial/03-Live-initialization/03-Live-initialization.ru.md"
            }
        }
    }
};
