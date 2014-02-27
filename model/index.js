module.exports = {
    get: function() {
        return [
            getMain()
        ]
    }
};

/**
 * Return main page section
 * @returns {{title: {en: string, ru: string}, route: {name: string, pattern: string}, view: string}}
 */
var getMain = function() {
        return {
            title: {
                en: "BEM. Block, Element, Modifier",
                ru: "БЭМ. Блок, Элемент, Модификатор"
            },
            route: {
                name: "index",
                    pattern: "/"
            },
            view: "index"
        }
    },

    /**
     * Returns delimeter
     * @returns {{type: string}}
     */
    getDelimeter = function() {
        return {
            type: "delimeter"
        };
    };
