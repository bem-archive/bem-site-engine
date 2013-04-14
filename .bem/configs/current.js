var BEM = require('bem');

//process.env.YENV = 'production';

module.exports = {

    libraries : BEM.util.extend(require('../repo.db'), {
        'bem-yana-stub' : {
            type : 'git',
            url  : 'git://github.com/narqo/bem-yana-stub.git'
        }
    })

};
