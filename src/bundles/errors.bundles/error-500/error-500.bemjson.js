({
    "block": "page",
    "title": "Error / BEM",
    "head": [
        [
            {
                "elem": "css",
                "url": "{STATICS_HOST}/bundles/errors.bundles/error-500/error-500.min.css",
                "ie": false
            },
            {
                "elem": "css",
                "url": "{STATICS_HOST}/bundles/errors.bundles/error-500/error-500.min",
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
                "content": "http://bem.info/500/"
            }
        }
    ],
    "content": [
        {
            "block": "error-billboard",
            "code": 500,
            "content": 500
        },
        {
            "block": "metrika"
        }
    ]
})