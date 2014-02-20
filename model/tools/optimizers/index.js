var borschik = require('./borschik'),
    csso = require('./csso'),
    svgo = require('./svgo'),
    setochka = require('./setochka');

module.exports = {
    get: function() {
        return {
            title: {
                en: "Optimizers",
                ru: "Оптимизаторы"
            },
            route: {
                conditions: {
                    group: "optimizers"
                }
            },
            type: "group",
            items: [
                borschik.get(),
                csso.get(),
                svgo.get(),
                setochka.get()
            ]
        };
    }
};

