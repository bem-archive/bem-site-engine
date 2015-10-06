({
    mustDeps: [
        { block: 'i-bem', elem: 'i18n' }
    ],
    shouldDeps: [
        'history',
        'jquery',
        'block-docs',
        'block-jsdoc',
        'block-example',
        { block: 'tabs', mods: { theme: 'default' } },
        { elems: ['header', 'title', 'message'] }
    ]
})
