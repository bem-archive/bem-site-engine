({
    mustDeps : [
        { block : 'i-bem', elems : ['dom', 'html'] }
    ],
    shouldDeps : [
        {
            block : 'check-button',
            mods : { size : 's', pseudo : 'yes' }
        },
        {
            block : 'i-request',
            mods : { type : 'ajax' }
        },
        { block : 'slide' }
    ]
})
