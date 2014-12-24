block('post').elem('content').match(function () {
    return !(this.ctx.content || []).length;
}).content()(function () {
    return {
        block: 'plug',
        content: [
            BEM.I18N('post', 'plug'),
            {
                block: 'link',
                url: this.ctx.url,
                content: BEM.I18N('post', 'plugLink')
            }
        ]
    };
});
