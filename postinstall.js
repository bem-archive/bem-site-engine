var path = require('path'),
    util = require('util'),
    cp = require('child_process'),

    _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs');

function getEnvironment() {
    //TODO implement your own environment detection
    return 'development';
}

function runCommand(cmd, opts, name) {
    var baseOpts = {
        encoding: 'utf8',
        maxBuffer: 1000000 * 1024
    };

    function _exec(cmd, options) {
        var proc = cp.exec(cmd, options),
            def = vow.defer(),
            output = '';

        proc.on('exit', function(code) {
            if (code === 0) { return def.resolve(); }
            def.reject(new Error(util.format('%s failed: %s', cmd, output)));
        });

        proc.stderr.on('data', function(data) { output += data; });
        proc.stdout.on('data', function(data) { output += data; });
        return def.promise();
    }

    console.info('execute command %s', cmd);

    return _exec(cmd, _.extend(opts, baseOpts))
        .then(function() {
            console.info('command completed %s', name);
            return vow.resolve();
        })
        .fail(function(error) {
            console.error('command %s failed with error %s', name, error);
            return vow.reject(error);
        });
}

function checkOrCreateDir(dir) {
    var directory = path.join(process.cwd(), dir),
        createDir = function() {
            console.info('create %s directory', dir);
            return vowFs.makeDir(directory);
        };
    return vowFs.isDir(directory)
        .then(function(isDir) {
            if(!isDir) {
                return createDir();
            }
            console.warn('directory %s already exists', dir);
            return vow.resolve();
        })
        .fail(createDir);
}

console.info('--- application install ---');
return vow.all([
        checkOrCreateDir('logs'),
        checkOrCreateDir('backups'),
        checkOrCreateDir('cache').then(function() {
            return vow.all([
                checkOrCreateDir('cache/branch'),
                checkOrCreateDir('cache/tag')
            ]);
        })
    ])
    .then(function() {
        return runCommand(util.format('ln -snf %s current', process.env.NODE_ENV || 'dev'), {
            cwd: path.join(process.cwd(), 'configs')
        }, 'set config');
    })
    .then(function() {
        var borschikPath = path.join('configs', 'current', 'borschik');
        return vowFs.exists(borschikPath).then(function(exists) {
            if(exists) {
                return runCommand(util.format('ln -sfn %s .borschik', borschikPath), {}, 'make borschik symlink');
            }
            return vow.resolve();
        });
    })
    .then(function() {
        return runCommand('bower-npm-install --non-interactive', {}, 'bower-npm-install');
    })
    .then(function() {
        return runCommand(util.format('YENV=%s enb make --no-cache', getEnvironment()), {}, 'enb make');
    })
    .then(function() {
        return console.info('--- application installed successfully ---');
    });
