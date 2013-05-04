module.exports = [
    { rule : '/', action : 'index' },
    { rule : '/libs/{id}', action : 'library' },
    { rule : '/libs/{id}/blocks/{block}', action : 'catalogue' }
];
