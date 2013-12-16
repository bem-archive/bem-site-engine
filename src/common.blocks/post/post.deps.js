({
    mustDeps : [
        { block : 'i-bem', elems : ['i18n'] }
    ],
    shouldDeps: [
        { block : 'author', mods : { view: ['full', 'menu-item', 'simple', 'avatar-only'] } },
        { mods: { view: ['full', 'menu-item', 'articles'] } },
        { elem : 'title' },
        { elem : 'date' },
        { elem : 'summary' },
        { elem : 'tags' },
        { elem : 'categories' },
        { elem : 'author' },
        { elem : 'type' },
        { elem : 'content' }
    ]
})