var express = require('express');
var router = express.Router();

var request = require('request');
var storage = require('azure-storage');

var _config = require('./config.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { config: _config });
});

var blobs = [];
router.get('/share', function (req, res, next) {

  var container = req.query.container ? req.query.container : _config.containerName;

  var cn = _config.connectionString;
  var blobService = storage.createBlobService(cn);

  blobs = [];
  blobService.getContainerProperties(container, function (err, resul) {
    blobService.listBlobsSegmented(container, null, function (err, result) {
      aggregateBlobs(err, result, function (err, blobs) {
        if (err) {
          //console.log("Couldn't list blobs");
          console.error(err);
        } else {
          //console.log(blobs);
        }
        res.render('share', {
          config: _config, blobs: blobs
        });
      });
    });
  });

});

function aggregateBlobs(err, result, cb) {
  if (err) {
    cb(er);
  } else {
    blobs = blobs.concat(result.entries);
    if (result.continuationToken !== null) {
      blobService.listBlobsSegmented(
        containerName,
        result.continuationToken,
        aggregateBlobs);
    } else {
      cb(null, blobs);
    }
  }
}

router.get('/sas/:blobName', function (req, res, next) {

  console.log("get '/sas/" + req.params.blobName + "'");

  var cn = _config.connectionString;
  var blobService = storage.createBlobService(cn);

  var blockBlobName = req.params.blobName;
  var container = req.query.container ? req.query.container : _config.containerName;

  var expiryDate = new Date();
  //expiryDate.setMinutes(expiryDate.getMinutes() + 30);
  expiryDate.setDate(expiryDate.getDate() + 1 * _config.expireday); 

  var sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: storage.BlobUtilities.SharedAccessPermissions.READ + storage.BlobUtilities.SharedAccessPermissions.LIST,
      Expiry: expiryDate
    },
  };

  var sas = blobService.generateSharedAccessSignature(container, blockBlobName, sharedAccessPolicy);
  var sasUrl = blobService.getUrl(container, blockBlobName, sas);

  //res.send(sasUrl);
  res.render('download', {url: sasUrl, config: _config });

});

router.get('/sasurl', function (req, res) {

  var cn = _config.connectionString;
  var blobService = storage.createBlobService(cn);

  var blockBlobName = req.query.blobName;
  var containerName = req.query.containerName ? req.query.containerName : _config.containerName;

  var expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 30);

  var sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: storage.BlobUtilities.SharedAccessPermissions.READ + storage.BlobUtilities.SharedAccessPermissions.WRITE + storage.BlobUtilities.SharedAccessPermissions.LIST,
      Expiry: expiryDate
    },
  };

  var sas = blobService.generateSharedAccessSignature(containerName, blockBlobName, sharedAccessPolicy);
  var sasUrl = blobService.getUrl(containerName, blockBlobName, sas);

  res.send(sasUrl);

});

// search
router.get('/search', function (req, res, next) {

  res.render('search', { title: "Search", config: _config, results: null });

});

router.post('/search', function (req, res, next) {

  if (!_config.searchAccount) {
    res.render('search',  {config: _config, results: null, keyword: null});
  } else {
    var keyword = req.body.keyword;
    var encodeKeyword = encodeURIComponent(keyword);
    console.log("post '/search',", encodeKeyword);
  
    var config = {
      uri: `https://${_config.searchAccount}.search.windows.net/indexes/${_config.schIndex}/docs?api-version=2015-02-28&search=${encodeKeyword}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': _config.searchApiKey
      },
      json: true
    };
  
    request(config, function (err, resp, body) {
      if (err) {
        res.render('error', { error: err });
      }
      else {
  
        var results = body.value;
  
        var urlpath = `https://${_config.accountName}.blob.core.windows.net/${_config.containerName}/`;
  
        results.forEach(function (element) {
          // get only filename from full urlpath
          element.file = element.path.replace(urlpath, "");
          element.file = decodeURIComponent(element.file);
          element.score = element['@search.score'];
        }, this);
  
        //console.log(JSON.stringify(body));
        res.render('search',  {config: _config, results: results, keyword: keyword});
      }
  
    });
      
  }

});


module.exports = router;
