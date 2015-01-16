modules.define('search_type_tags', ['logger', 'model'], function (provide, logger, model) {
    provide({
        convert: function (result) {
            return result.map(function (item) {
                return {
                    class: 'post',
                    category: item.title,
                    items: item.items
                };
            });
        },

        search: function (text, lang) {
            return model
                .getNodesByTagsCriteria(lang, text)
                .then(function (results) {
                    return results.length ? this.convert(results) : [];
                }, this);
        }
    });
});
