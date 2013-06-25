(function(conf) {

modules.define('yana-config', ['yana-util'], function(provide, util, defaults) {
    provide(util.extend(defaults, conf));
});

}(require('legoa-conf')));