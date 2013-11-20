({
    mustDeps : [
        { block : 'i-bem', elems : ['dom', 'html', 'tree'] }
    ],
    shouldDeps : [
        { mods : { theme : 'white' } },
        { mods : { page : 'error' } },
        { mods : { touch : 'yes' } },
        { block : 'link' },
        { block : 'island' },
        { block : 'layout', mods : { type : 'serp' } },
        { block : 'layout', mods : { section : '100' } },
        { block : 'content' },
        { block : 'metrika' }

    ]
})
