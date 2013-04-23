({
    noDeps: [
        { block : 'modules' }
    ],
    shouldDeps : [
        { block : 'yana-http' },
        { block : 'yana-handler', mods : { 'type' : 'common' } },
        { block : 'yana-cluster' },
        { elem : 'config' }
    ]
})