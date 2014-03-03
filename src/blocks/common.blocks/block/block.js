modules.define('i-bem__dom', function(provide, BEMDOM) {

BEMDOM.decl('block', {

    onSetMod: {
        js: {
            inited: function() {
                var _this = this,
                    tabs = _this.findBlockInside('tabs'),
                    // tabs = BEMDOM.blocks['tabs'],
                    examples = _this.findBlocksInside('block-example');

                tabs.on('select', function(e, data) {
                    if(tabs.hasMod(data.newTab, 'examples', 'yes')) {
                        examples.forEach(function(example) {
                            example.loadIframe('live');
                        });

                        tabs.un('select');
                    }
                });
            }
        }
    }

});

provide(BEMDOM);

});
