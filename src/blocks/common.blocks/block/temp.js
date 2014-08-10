block('block')(
    content()(function() {

        var tabsHeader = [],
            tabsContent = [],
            lang = this.data.lang,
            source = this.data.node.source,
            jsdoc = source.jsdoc;

        if(source.data) {
            var data = source.data[lang] ? source.data[lang] : source.data,
                description = data.description ? data.description : null,
                examples = data.examples ? data.examples : null,
                title = this.data.node.title[lang];

            /*(Begin) Description tab */
            if(description) {

                // support old structure
                if(this.isArray(description) && description.length && description[0].content) {
                    description = data.description[0].content;
                }

                var buf = [],
                    sign = '<!--bem-example-->',
                    inlineExamples = [];

                description = description.replace(/<!--\sbem-example:\s(\S+)\s-->/g, function(str, p1) {
                    inlineExamples.push(apply('examples', {ctx: {examples: [{ url: p1 }] }} ));
                    return sign;
                });

                description.split(sign).forEach(function(item, index) {
                    buf.push(item);
                    buf.push(inlineExamples[index]);
                });

                description = buf;

                if(description.length > 1) {
                    tabsHeader.push({
                        elem: 'tab',
                        attrs: { 'data-tab': 'docs' },
                        mods: { 'side': 'left' },
                        content: BEM.I18N('block', 'docs')
                    });

                    tabsContent.push({
                        elem: 'pane',
                        content: [
                            {
                                block: this.block,
                                elem: 'title',
                                content: BEM.I18N('block', 'static-title') + ' ' + title
                            },
                            {
                                block: 'block-docs',
                                mix: { block: 'post', elem: 'content' },
                                content: description
                            }
                        ]
                    });
                }
            }
            /*(End) Description tab */

            /*(Begin) Examples tab */
            if(examples && this.isArray(examples) && examples.length) {
                var examplesViewOld = examples[0].content && examples[0].content.length,
                    examplesViewNew = !examples[0].content && examples.length;

                if(examplesViewOld || examplesViewNew) {
                    tabsHeader.push({
                        elem: 'tab',
                        attrs: { 'data-tab': 'examples' },
                        mods: { 'side': 'right', 'examples': 'yes' },
                        content: BEM.I18N('block', 'examples')
                    });

                    tabsContent.push({
                        elem: 'pane',
                        content: [
                            apply('examples')
                        ]
                    });
                }
            }
            /*(End) Examples tab */
        }

        if(jsdoc) {
            tabsHeader.push({
                elem: 'tab',
                attrs: { 'data-tab': 'jsdoc' },
                content: BEM.I18N('block', 'jsdoc')
            });

            tabsContent.push({
                elem: 'pane',
                content: {
                    block: 'block-jsdoc',
                    mix: { block: 'post', elem: 'content' }
                }
            });
        }

        if(!tabsHeader.length) {
            return {
                elem: 'message',
                content: [
                    {
                        block: 'post',
                        elem: 'title',
                        elemMods: { level: '1' },
                        content: BEM.I18N('block', 'warning-title')
                    },
                    {
                        block: 'post',
                        elem: 'content',
                        content: BEM.I18N('block', 'warning-text')
                    }
                ]
            }
        }

        return {
            block: 'tabs',
            mods: { theme: 'default' },
            content: [
                {
                    elem: 'header',
                    content: tabsHeader
                },
                {
                    elem: 'content',
                    content: tabsContent
                }
            ]
        }
    }),

    mode('examples')(function() {
        //TODO remove it
        console.log('!!! ' + this.ctx.examples);
        //this.ctx.examples = [{ url: 'desktop.examples/button/Rb77AVqNcSM2UUBxbCkUkHULKWc' }];

        var lang = this.data.lang,
            source = this.data.node.source,
            prefix = source.prefix,
            data = source.data[lang] ? source.data[lang] : source.data,
            examples = this.ctx.examples || data.examples[0].content || data.examples;

        return examples.map(function(example) {
            var path = example.url.replace(/\.(ru|en)/, ''),
                parts = path.split('/'),
                name = parts[parts.length - 1],
                url;
            if(parts[parts.length - 1] === parts[parts.length - 2]) {
                // old structure enb-bem-docs
                url = prefix + '/' + path + '.html';
                bemjson = null;
            } else {
                // new structure enb-bem-docs
                url = prefix + '/' + path + '/' + name + '.html';
                bemjson = prefix + '/' + path + '/_' + name + '.bemjson.js';
            }
            return [
                {
                    block: 'block-example',
                    js: {
                        bemjsonUrl: bemjson,
                        copyHoverClass: 'source-copy-hover'
                    },
                    content: [
                        {
                            elem: 'header',
                            content: [
                                {
                                    block: 'link',
                                    url: url,
                                    attrs: { target: '_blank' },
                                    mix: [{ block: 'block-example', elem: 'link', elemMods: { icon: 'blank' } }],
                                    content: ' (' + name + ')'
                                },
                                bemjson ?
                                {
                                    block: 'link',
                                    url: '#',
                                    mix: [
                                        { block: 'block-example', elem: 'link', elemMods: { icon: 'source' } },
                                        { block: 'block-example', elem: 'source-link' }
                                    ],
                                    content: 'BEMJSON'
                                } : undefined
                            ]
                        },
                        bemjson ?
                        {
                            elem: 'source',
                            content: [
                                {
                                    elem: 'source-code',
                                    attrs: { 'data-url': bemjson }
                                },
                                {
                                    block: 'link',
                                    mods: { type: 'block' },
                                    mix: [{ block: 'block-example', elem: 'source-copy' }],
                                    content: BEM.I18N('block-example', 'copy')
                                }
                            ]
                        } : undefined,
                        {
                            elem: 'live',
                            attrs: { 'data-url': url }
                        }
                    ]
                }
            ]
        })
    })
);

