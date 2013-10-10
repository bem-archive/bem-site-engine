({
    mustDeps : [
        { block : 'i-bem', elems : ['i18n'] }
    ],
    shouldDeps: [
        { block : 'author', mods : { view: ['full', 'menu-item', 'simple'] } },
        { mods: { view: ['full', 'menu-item', 'menu-item-with-date', 'articles'] } },
        { elem : 'title' },
        { elem : 'date' },
        { elem : 'summary' },
        { elem : 'tags' },
        { elem : 'categories' },
        { elem : 'author' },
        { elem : 'translator' },
        { elem : 'type' },
        { elem : 'content' }
    ]
})
