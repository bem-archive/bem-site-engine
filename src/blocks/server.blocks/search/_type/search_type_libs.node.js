modules.define('search_type_libs', ['logger', 'model'], function(provide, logger, model) {
    provide({
        search: function (text, lang) {
            // var startTime = +(new Date());
            return model
                .getNodesByCriteria(function (record) {
                    var v = record.value;
                    return v.lib && v.lib.indexOf(text) > -1;
                }, false)
                .then(function (records) {
                    // console.log('SEARCH LIBS TIME: %s', (+(new Date() - startTime)));
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
