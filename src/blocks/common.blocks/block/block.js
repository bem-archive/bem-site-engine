modules.define('i-bem__dom', ['jquery'], function(provide, $, BEMDOM) {

BEMDOM.decl('block', {

    onSetMod: {
        js: {
            inited: function() {
                var _this = this,
                    tabs = _this.findBlockInside('tabs');

                // open active tab on load page
                if(window.location.hash !== '') {
                    _this.openSavedTab(tabs);
                } else {
                    tabs.setActiveTab(0);
                }

                // save active tab
                tabs.bindTo(tabs.elem('tab'), 'pointerclick', function(e) {
                    _this.saveTabHash($(e.currentTarget).data('tab'));
                });

                // lazy examples load
                tabs.on('select', function(e, data) {
                    if(tabs.hasMod(data.newTab, 'examples', 'yes')) {
                        _this.loadExamples();

                        tabs.un('select');
                    }
                });
            }
        }
    },

    openSavedTab: function(tabs) {
        var _this = this;

        tabs.elem('tab').each(function(idx, tab) {
            if($(tab).data('tab') === window.location.hash) {
                tabs.setActiveTab($(tab));
            }

            if(tabs.hasMod(tabs.getCurrentTab(), 'examples', 'yes')) {
                _this.loadExamples();
            }
        });
    },

    saveTabHash: function(hash) {
        window.location.hash = hash;
    },

    loadExamples: function() {
        this.findBlocksInside('block-example').forEach(function(example) {
            example.loadIframe('live');
        });
    }

});

provide(BEMDOM);

});
