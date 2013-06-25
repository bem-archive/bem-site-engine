({
    noDeps: [
        { block : 'modules' }
    ],
    shouldDeps : [
        { block : 'yana-http', mods : { domain : 'yes' } },
        { block : 'yana-handler', mods : { 'type' : 'common' } },
        { block : 'yana-cluster' },
        { elem : 'config' }
    ]
})