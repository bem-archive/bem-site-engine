module.exports = {
    get: function() {
        return [
            getMain()
        ]
    }
};

/**
 * Return main page section
 * @returns {{title: {en: string, ru: string}, route: {name: string, pattern: string}, view: string}}
 */
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
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/pages/dummy/dummy.en.md"
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
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/pages/dummy/dummy.ru.md"
                }
            }
        };
    },

    /**
     * Returns delimeter
     * @returns {{type: string}}
     */
    getDelimeter = function() {
        return {
            type: "delimeter"
        };
    };
