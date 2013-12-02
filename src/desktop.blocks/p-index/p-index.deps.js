({
    mustDeps : [
        { block : 'i-bem', elems : ['i18n'] },
        { block : 'headline' }
    ],
    shouldDeps: [
        { elem: 'logo', mods: { theme: ['batman', 'breaks', 'captain-america',
            'generated', 'ironman', 'motion', 'robin', 'scheme', 'spots', 'stripe', 'waves'] } },
        { elem: 'title'},
        { elem: 'phrase'},
        { elem: 'link'},
        { elem: 'ya'},
        { block: 'ya-logo'}
    ]
})
