var path = require('path'),

    vow = require('vow'),
    sha = require('sha1'),

    utility = require('../util'),
    constants = require('../constants'),
    providers = require('../providers');

function prepareToSave(content) {
    return {
        sitemap: utility.removeCircularReferences(content.sitemap),
        routes: content.routes,
        docs:   content.docs,
        urls:   content.dynamic,
        people: content.people,
        blocks: content.blocksHash
    };
}

module.exports = function(obj) {

    var snapshot = utility.getSnapshotName(),
        data = prepareToSave(obj);
    return providers.getProviderFile()
        .makeDir({ path: path.join('backups', snapshot) })
        .then(function() {
            var tasksForSave = [
                {
                    data: JSON.stringify(data),
                    archive: true
                },
                {
                    data: obj.sitemapXml
                },
                {
                    data: JSON.stringify(obj.search.libraries),
                    archive: true
                },
                {
                    data: JSON.stringify(obj.search.blocks),
                    archive: true
                },
                {
                    data: JSON.stringify({
                        data: sha(JSON.stringify(data)),
                        date: snapshot
                    })
                }
            ];

            return tasksForSave.reduce(function (prev, item, index) {
                    return prev.then(function() {
                        item.path = path.join('backups', snapshot, constants.FILES[index]);
                        return providers.getProviderFile().save(item);
                    });
                }, vow.resolve())
                .then(function() {
                    return snapshot;
                });
        });
};
