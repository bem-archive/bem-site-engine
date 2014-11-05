modules.define('search-item', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {
    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: {
                inited: function() {
                    this._select = this.findBlockInside('select');

                    this._select && this._select.on('change', this._onSelectChange, this);
                    this._setDescription();
                }
            }
        },

        _onSelectChange: function() {
            var val = this._select.getVal();

            this._replaceLevelsUrl(val);
        },

        _replaceLevelsUrl: function(newVersion) {
            this.elem('level').each(function(idx, level) {
                var $level = $(level),
                    url = $level.attr('href'),
                    oldVersion = url.match(/^\/.+?\/.+?\/(.+?)\//)[1], // Match on the version /libs/bem-components/[v2.0.0]/desktop/button/
                    newUrl;

                newUrl = url.replace(oldVersion, newVersion);
                $level.attr('href', newUrl);
            });
        },

        _setDescription: function() {
            var $desc = this.elem('description'),
                $paragraphs = $desc.find('p');

            $paragraphs.each(function(idx, paragraph) {
                var paragraphInner = $(paragraph).html().trim();

                if(paragraphInner !== '') {
                    $desc.html(paragraphInner);

                    return false;
                }
            });

            if($desc.text() === '') $desc.remove();
        }
    }));
});
