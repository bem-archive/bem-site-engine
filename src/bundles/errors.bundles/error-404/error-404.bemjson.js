({
    "block": "page",
    "title": "Error / BEM",
    "head": [
        [
            {
                "elem": "css",
                "url": "{STATICS_HOST}/bundles/errors.bundles/error-404/error-404.min.css",
                "ie": false
            },
            {
                "elem": "css",
                "url": "{STATICS_HOST}/bundles/errors.bundles/error-404/error-404.min",
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
            "block": "error-billboard",
            "code": 404,
            "content": 404
        },
        {
            "block": "metrika"
        }
    ]
})