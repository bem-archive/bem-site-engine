block('post').elem('title')(
    def().match(function () {
        return !this.ctx.content || this.ctx.content.length === 0;
    })(false),

    match(function () {
        var mods = this.ctx.elemMods;

        return mods && mods.level;
    }).tag()(function () {
        return 'h' + this.ctx.elemMods.level;
    }),

    match(function () {
        return this.ctx.url;
    }).content()(function () {
        var ctx = this.ctx;

        return {
            block: 'link',
            url: ctx.url,
            content: ctx.content
        };
    })

);
