modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

// router.addRoute({
//     name : 'post',
//     rule : '/{type}/{id}',
//     data : {
//         action : 'le-page'
//     }
// });

provide(View);

});
