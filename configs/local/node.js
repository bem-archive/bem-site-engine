var env = process.env;
module.exports = {
    debug : env.NODE_ENV == 'production'? false : true,
    app : {
        env : 'development',
        port : env.PORT || 3014,
        workers : env.WORKERS || 1
    },
    logger : {
        level : 'debug'
    }
};
