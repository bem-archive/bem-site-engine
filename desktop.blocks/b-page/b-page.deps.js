({
    mustDeps : [
        { block : 'i-bem', elems : ['tree'] }
    ],
    shouldDeps : [
        { block : 'static-text' },
        { block : 'headline' },
        { block : 'link' },
        { block : 'olist' },
        { block : 'ulist' },
        { block : 'island' },
        { mods : { theme : 'normal' } },
        { block : 'header' },
        { block : 'layout', mods : { type : 'serp' } },
        { block : 'layout', mods : { section : '100' } },
        { block : 'content' },
        { block : 'footer' }
    ]
})
