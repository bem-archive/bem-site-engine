modules.define('search_type_libs', ['logger', 'model'], function(provide, logger, model) {
    provide({
        search: function (text, lang) {
            return model
                .getNodesByCriteria(function (record) {
                    var k = record.key,
                        v = record.value;
                    return text.length > 1 && k.indexOf('nodes:') > -1 &&
                        v.lib && v.lib.indexOf(text) > -1;
                }, false)
                .then(function (records) {
                    var libs = records.map(function(record) {
                        return record.value;
                    });

                    return libs.length ? [{
                        class: 'post',
                        category: lang === 'ru' ? 'Библиотеки' : 'Libs',
                        items: libs
                    }] : [];
                });
        }
    });
});
