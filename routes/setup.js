var express = require('express');
var router = express.Router();

var request = require('request');
var _config = require('./config.js');

/* GET users listing. */
router.get('/', function (req, res, next) {

    if (_config.searchAccount && _config.searchAccount)
    {
        var config = {
            uri: `https://${_config.searchAccount}.search.windows.net/datasources/${_config.schDatasource}?api-version=2016-09-01`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'api-key': _config.searchApiKey
            },
            json: true
        };
    
        request(config, function (err, resp, results) 
        {
            if (err) {
                res.render('error', { error: err });
            }
            else {
                var step;
                if (results && results.name)
                {
                    step = {error: true};
                    res.render('setup', 
                        { step: step, 
                          error: `search setup already configured (datasource '${_config.schDatasource}' is existed in search service)` });
                } else {
                    step = { datasource: true };
                    res.render('setup', { step: step });
                }
            }
    
        });
    } 
    else {
        step = {error: true};
        res.render('setup', { step: step, error: "search service is not configured" });
    }



});

router.post('/datasource', function (req, res, next) {

    var body = {
        "name": _config.schDatasource,
        "type": "azureblob",
        "credentials": { "connectionString": _config.connectionString },
        "container": { "name": _config.containerName }
    }

    var config = {
        uri: `https://${_config.searchAccount}.search.windows.net/datasources?api-version=2016-09-01`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': _config.searchApiKey
        },
        body: body,
        json: true
    };


    request(config, function (err, resp, results) 
    {

        if (err) {
            res.render('error', { error: err });
        }
        else {
            var step = { };
            if (results && results.name)
            {
                step = { index: true };
                res.render('setup', { step: step});
            } else {
                step = {error: true};
                res.render('setup', { step: step, error: results.error.message });
            }
        }

    });

});

router.post('/createindex', function (req, res, next) {

    var body = {
        "name": _config.schIndex,
        "fields": [
            { "name": "id", "type": "Edm.String", "key": true, "searchable": false },
            { "name": "content", "type": "Edm.String", "searchable": true, "filterable": false, "sortable": false, "facetable": false },
            { "name": "path", "type": "Edm.String", "searchable": false, "filterable": false, "sortable": false, "facetable": false },
            { "name": "fileSize", "type": "Edm.Int64", "searchable": false, "filterable": false, "sortable": false, "facetable": false },
            { "name": "author", "type": "Edm.String", "searchable": true, "filterable": false, "sortable": false, "facetable": false },
            { "name": "content_type", "type": "Edm.String", "searchable": false, "filterable": true, "sortable": false, "facetable": false }
        ]
    }

    var config = {
        uri: `https://${_config.searchAccount}.search.windows.net/indexes?api-version=2016-09-01`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': _config.searchApiKey
        },
        body: body,
        json: true
    };

    request(config, function (err, resp, results) {
        if (err) {
            res.render('error', { error: err });
        }
        else {
            var step = { };
            if (results && results.name)
            {
                step = { indexer: true };
                res.render('setup', { step: step });
            } else {
                step = {error: true};
                res.render('setup', { step: step, error: results.error.message });
            }
        }

    });

});

router.post('/createindexer', function (req, res, next) {

    var body = {
        "name": _config.schIndexer,
        "dataSourceName": _config.schDatasource,
        "targetIndexName": _config.schIndex,
        "fieldMappings": [
            { "sourceFieldName": "metadata_storage_path", "targetFieldName": "path" },
            { "sourceFieldName": "metadata_storage_size", "targetFieldName": "fileSize" },
            { "sourceFieldName": "metadata_content_type", "targetFieldName": "content_type" },
            { "sourceFieldName": "metadata_author", "targetFieldName": "author" }
        ]
    };

    var config = {
        uri: `https://${_config.searchAccount}.search.windows.net/indexers?api-version=2016-09-01`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': _config.searchApiKey
        },
        body: body,
        json: true
    };


    request(config, function (err, resp, results) {
        if (err) {
            res.render('error', { error: err });
        }
        else {
            var step = { };
            if (results && results.name)
            {
                step = { done: true };
                res.render('setup', { step: step });
            } else {
                step = {error: true};
                res.render('setup', { step: step, error: results.error.message });
            }
        }

    });

});

module.exports = router;
