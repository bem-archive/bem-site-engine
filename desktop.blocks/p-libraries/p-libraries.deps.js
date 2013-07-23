({
    mustDeps : [
        { block : 'i-bem' },
        { block : 'error' },
        { block : 'i-global' }
    ],
    shouldDeps : [
        { block : 'topic' },
        { block : 'link' },
        { elem : 'list', mods : { type: ['libraries', 'blocks'], fixed : 'yes' } },
        { elem : 'list-item', mods : { type: ['libraries', 'blocks', 'block'],  active : 'yes' } } 
    ]
})