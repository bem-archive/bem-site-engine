modules.define(
    'i-bem__dom',
    ['jquery', 'dom', 'events'],
    function(provide, $, dom, events, BEMDOM) {

BEMDOM.decl('b-page', {

    onSetMod : {
        'js' : {
            'inited' : function() {
                this._resizePostContent()
                    .bindToWin('resize', this._resizePostContent.bind(this));
            }
        }
    },

    _resizePostContent: function() {
        console.log('resize post content');

        var windowW = BEMDOM.win.width();
            mainMenuW = this.findBlockInside('main-menu').domElem.width();
            menusW = this.findBlocksInside('menu').reduce(function(prev, item) {
            return prev + item.domElem.width();
        }, 0);

        this.findBlockInside({ block: 'post', modName: 'view', modVal: 'full' })
            .domElem.width(windowW - mainMenuW - menusW - 30)

        return this;
    }
});

provide(BEMDOM);

});
