({
    mustDeps : [
        { block : 'i-bem', elems : ['html', 'tree', 'dom', 'i18n'] }
    ],
    shouldDeps : [
        { block : 'link' },
        { block : 'check-button' },
        { elem : 'header' },
        { elem : 'readme', mods : { visible : 'yes' } },
        { elem : 'icon', mods : { size : ['library', 'block'] }},
        { mods : { type: ['library', 'blocks', 'block'] }}  
    ]
})