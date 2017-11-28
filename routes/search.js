var request = require('request');
var _config = require('./config.js');

module.exports = {

    getSearchResult: function (page, keyword, cb) {

        var skip = _config.pageSize * (page - 1);
        var config = {
            uri: 'https://' + _config.searchAccount + '.search.windows.net/indexes/' + _config.schIndex + '/docs?api-version=2015-02-28&$top=' + _config.pageSize + '&$skip=' + skip + '&$count=true&search=' + encodeURIComponent(keyword),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'api-key': _config.searchApiKey
            },
            json: true
        };

        request(config, function (err, resp, body) {

            if (err || body.error) {
                return cb(err);
            }

            var results = body.value;

            var urlpath = `https://${_config.accountName}.blob.core.windows.net/${_config.containerName}/`;

            results.forEach(function (element) {
                element.path = decodeURIComponent(element.path);

                element.file = element.path.replace(urlpath, "");
                element.score = element['@search.score'];
            }, this);

            var count = body['@odata.count'];
            var pcount = Math.ceil(count / _config.pageSize);

            cb(err, resp, results, pcount, count);

        });
    }
};