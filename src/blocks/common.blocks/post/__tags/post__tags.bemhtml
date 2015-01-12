block('post').elem('tags')(
    def().match(function () {
        return !(this.ctx.content || []).length;
    })(false),

    content()(function () {
        return this.ctx.content.map(function (item) {
            return [
                {
                    block: 'link',
                    url: '/tags/' + item,
                    content: item
                },
                {
                    tag: 'span',
                    content: ' '
                }
            ];
        });
    })
);
