module.exports = {
    get: function() {
        return [
            getMain()
        ]
    }
};

var getMain = function() {
    return {
        title: {
            en: "Hello Bem-Engine",
            ru: "Привет Bem-Engine"
        },
        route: {
            name: "index",
            pattern: "/"
        },
        source: {
            en: {
                title: "Hello Bem-Engine",
                createDate: "28-02-2014",
                editDate: "",
                summary: "",
                thumbnail: "",
                authors: [],
                tags: [],
                translators: [],
                content: "https://github.yandex-team.ru/bem/bem-engine/tree/README.md"
            },
            ru: {
                title: "Привет Bem-Engine",
                createDate: "28-02-2014",
                editDate: "",
                summary: "",
                thumbnail: "",
                authors: [],
                tags: [],
                translators: [],
                content: "https://github.yandex-team.ru/bem/bem-engine/tree/README.md"
            }
        }
    };
};
