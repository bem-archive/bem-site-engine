({
    mustDeps: { block: 'i-bem', elems: ['i18n'] },
    shouldDeps: [
        {
            block: 'image'
        },
        {
            block: 'link',
            mods: { pseudo: true, theme: 'normal' }
        },
        {
            block: 'dropdown',
            mods: { switcher: 'link', theme: 'islands' }
        },
        {
            mods: {
                view: ['inline', 'default']
            },
            elems: [
                'anchor',
                'blank',
                'header',
                'link',
                'live',
                'live-spin',
                'live-wrap',
                'source',
                'source-code',
                'source-copy',
                'source-item',
                'source-switcher',
                'qr'
            ]
        }
    ]
});
