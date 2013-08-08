({
    mustDeps : [
        { block : 'i-bem' }
    ],
    shouldDeps : [
        { block : 'link' },
        { block : 'check-button' },
        { elem : 'header' },
        { elem : 'readme', mods : { visible : 'yes' } },
        { elem : 'icon', mods : { size : ['library', 'block'], 'no-image' : ['library', 'block'] }},
        { mods : { type: ['library', 'blocks', 'block'], active : 'yes' }}  
    ]
})