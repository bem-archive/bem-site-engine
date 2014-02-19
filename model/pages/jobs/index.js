module.exports = {
    get: function() {
        return {
            title: {
                ru: "Работа"
            },
            route:{
                name: "jobs",
                pattern: "/jobs(/)"
            },
            source: {
                en: {
                    title: "We are hiring",
                    createDate: "24-09-2013",
                    editDate: "",
                    summary: "",
                    thumbnail: "",
                    authors: [],
                    tags: [],
                    translators: [],
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/pages/jobs/jobs.en.md"
                },
                ru: {
                    title: "Работа в команде БЭМ",
                    createDate: "24-09-2013",
                    editDate: "",
                    summary: "",
                    thumbnail: "",
                    authors: [],
                    tags: [],
                    translators: [],
                    content: "https://github.com/bem/bem-method/tree/bem-info-data/pages/jobs/jobs.ru.md"
                }
            },
            hidden: ["en"]
        };
    }
};
