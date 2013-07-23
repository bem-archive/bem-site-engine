({
    mustDeps : [
        { block : 'i-bem', elems : ['html', 'tree', 'dom'] },
        { block : 'i-bem', elem : 'html', mods : { async : 'yes' } },
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