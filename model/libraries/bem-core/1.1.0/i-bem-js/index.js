module.exports = {
    get: function() {
        return {
            title: "i-bem.js"
            route: {
                conditions: {
                    level: "i-bem-js"
                }
            },
            type: "group",
            items: [
                getIBemJs()
            ]
        }
    }
};

var getIBemJs = function() {
    return {
        "title": {
            "en": "i-bem.js Guide Book",
            "ru": "i-bem.js: Руководство пользователя"
        },
        "route": {
            "conditions": {
                "id": "i-bem-js"
            }
        },
        source: {
            en: {
                "title": "i-bem.js Guide Book",
                "createDate": "17-09-2013",
                "editDate": "",
                "summary": "i-bem.js guide book.",
                "thumbnail": "",
                "authors": ["maslinsky-kirill"],
                "tags": ["bem-core","i-bem"],
                "translators": [],
                content: "https://github.com/tormozz48/bem-core/tree/b1.0.0/common.docs/i-bem-js/i-bem-js.en.md"
            },
            ru: {
                "title": "i-bem.js: Руководство пользователя",
                "createDate": "17-09-2013",
                "editDate": "",
                "summary": "Руководство пользователя.",
                "thumbnail": "",
                "authors": ["maslinsky-kirill"],
                "tags": ["bem-core","i-bem"],
                "translators": [],
                content: "https://github.com/tormozz48/bem-core/tree/b1.0.0/common.docs/i-bem-js/i-bem-js.ru.md"
            }
        }
    }
};
