({
    mustDeps : [
        { block : 'i-bem', elems : ['html', 'tree', 'i18n'] }
    ],
    shouldDeps : [
        { block : 'section' },
        { block : 'bk-example' },
        {
            elems : [
                'level',
                'mod',
                'elem',
                'title',
                'incut',
                'description',
                'examples'
            ]
        }
    ]
})