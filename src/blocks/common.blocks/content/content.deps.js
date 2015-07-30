({
    mustDeps: [
        { block: 'i-bem', elems: ['dom', 'html', 'tree'] },
    ],
    shouldDeps: [
        { block: 'code' },
        { mods: { view: ['post', 'posts', 'index', 'authors', 'author', 'block', 'tags', 'showcase'] } },
        { elems: ['fullscreen', 'arrow-up'] },
        { block: 'functions', elem: 'throttle' }
    ]
})
