({
    "block": "page",
    "title": "Error / BEM",
    "mods": {
        "theme": "white",
        "page": "error"
    },
    "head": [
        [
            {
                "elem": "css",
                "url": "{STATICS_HOST}/bundles/desktop.bundles/common/_common.css",
                "ie": false
            },
            {
                "elem": "css",
                "url": "{STATICS_HOST}/bundles/desktop.bundles/common/_common",
                "ie": true
            }
        ],
        {
            "elem": "meta",
            "attrs": {
                "property": "og:title",
                "content": "Error / BEM"
            }
        },
        {
            "elem": "meta",
            "attrs": {
                "property": "og:type",
                "content": "article"
            }
        },
        {
            "elem": "meta",
            "attrs": {
                "property": "og:url",
                "content": "http://bem.info/404/"
            }
        }
    ],
    "content": [
        {
            "block": "content",
            "layout": {
                "block": "layout",
                "elem": "col",
                "mods": {
                    "type": "center"
                }
            },
            "content": [
                {
                    "block": "main-menu",
                    "content": [
                        {
                            "elem": "wrapper",
                            "content": [
                                {
                                    "block": "logobem",
                                    "url": "http://bem.info"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "normal",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "/method",
                                    "name": "method"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "normal",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "/tools",
                                    "name": "tools"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "normal",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "/libs",
                                    "name": "libs"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "type": "delimeter"
                                    }
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "normal",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "/articles",
                                    "name": "articles"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "normal",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "/news",
                                    "name": "news"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "normal",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "/tags",
                                    "name": "tags"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "normal",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "/authors",
                                    "name": "authors"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "normal",
                                        "active": "",
                                        "hidden": "yes"
                                    },
                                    "url": "/jobs",
                                    "name": "jobs"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "type": "delimeter"
                                    }
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "small",
                                        "active": "",
                                        "hidden": "yes"
                                    },
                                    "url": "http://clubs.ya.ru/bem/",
                                    "name": "yaru"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "small",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "http://www.facebook.com/#!/groups/209713935765634/",
                                    "name": "facebook"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "small",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "https://twitter.com/bem_en",
                                    "name": "twitter"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "small",
                                        "active": "",
                                        "hidden": ""
                                    },
                                    "url": "/acknowledgement",
                                    "name": "acknowledgement"
                                },
                                {
                                    "elem": "item",
                                    "elemMods": {
                                        "size": "small",
                                        "type": "lang-switch"
                                    },
                                    "url": "http://ru.bem.info/404/",
                                    "name": "lang"
                                },
                                {
                                    "block": "search",
                                    "action": "http://yandex.com/sitesearch",
                                    "content": [
                                        {
                                            "block": "input",
                                            "name": "text",
                                            "val": ""
                                        },
                                        {
                                            "block": "button",
                                            "type": "submit"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "block": "p-error",
                    "mix": [
                        {
                            "block": "layout",
                            "elem": "col",
                            "elemMods": { type: "center" }
                        },
                        {
                            "block": "layout",
                            "elem": "page"
                        }
                    ],
                    "code": 404,
                    "content": 404
                }
            ]
        },
        {
            "block": "metrika"
        }
    ]
})