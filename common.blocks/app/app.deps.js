({
    noDeps: [
        { block : 'modules' }
    ],
    shouldDeps : [
        { block : 'http' },
        { block : 'handler', mods : { 'type' : 'common' } },
        { block : 'cluster' },
        { elem : 'config' }
    ]
})