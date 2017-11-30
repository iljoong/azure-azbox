var express = require('express');
var router = express.Router();

var request = require('request');
var storage = require('azure-storage');
var dateFormat = require('dateformat');

var search = require('./search.js');
var _config = require('./config.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { config: _config });
});

var opt = { delimiter: "" };
var blobs = [];

/*
router.get('/list', function (req, res, next) {

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
*/

Array.prototype.sortByProp = function (p) {
  return this.sort(function (a, b) {
    return (a[p] > b[p]) ? 1 : (a[p] < b[p]) ? -1 : 0;
  });
};

Array.prototype.sortByPropDec = function (p) {
  return this.sort(function (a, b) {
    return (a[p] < b[p]) ? 1 : (a[p] > b[p]) ? -1 : 0;
  });
};


// THIS IS EXPERIMENTAL
router.get('/list', function (req, res, next) {

  var container = req.query.container ? req.query.container : _config.containerName;
  //var folder = (req.params.folder) ?  req.params.folder + "/" : "";
  // /list?d="xxxx/sssss"
  var folder = (req.query.d) ? req.query.d + '/' : "";
  var sort = (req.query.s) ? req.query.s : 'name';

  var cn = _config.connectionString;
  var blobService = storage.createBlobService(cn);

  blobs = [];
  blobService.getContainerProperties(container, function (err, resul) {
    blobService.listBlobsSegmentedWithPrefix(container, folder, null, opt, function (err, result) {
      aggregateBlobs(folder, err, result, function (err, blobs) {
        if (err) {
          //console.log("Couldn't list blobs");
          console.error(err);
        } else {
          //console.log(blobs);
        }

        if (sort == 'date') {
          blobs.forEach(function (element) {
            element.date = dateFormat(element.lastModified, 'isoDateTime');
          }, this);
        }

        res.render('share', {
          config: _config, blobs: (sort == 'name') ? blobs : blobs.sortByPropDec('date'),
          count: blobs.length
        });
      });
    });
  });

});

function aggregateBlobs(folder, err, result, cb) {
  if (err) {
    cb(er);
  } else {
    blobs = blobs.concat(result.entries);
    if (result.continuationToken !== null) {
      blobService.listBlobsSegmentedWithPrefix(
        containerName,
        folder,
        opt,
        result.continuationToken,
        aggregateBlobs);
    } else {
      cb(null, blobs);
    }
  }
}


//router.get('/sas/:blobName', function (req, res, next) {
router.get('/sas', function (req, res, next) {

  //var blobName = req.params.blobName;
  var blobName = req.query.f;

  //console.log("get '/sas/" + req.params.blobName + "'");
  console.log("get '/sas/" + blobName + "'");

  var cn = _config.connectionString;
  var blobService = storage.createBlobService(cn);

  var blockBlobName = blobName;
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
  res.render('download', { url: sasUrl, config: _config });

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

router.post('/search', function (req, res, next) {

  var keyword = req.body.keyword;
  var page = 1;

  if (!_config.searchAccount || !keyword) {
    res.render('search', { config: _config, results: null, keyword: null });
  } else {

    console.log("post '/search',", keyword);

    search.getSearchResult(1, keyword, function (err, resp, results, pcount, count) {

      //console.log(JSON.stringify(body));
      res.render('search', { config: _config, results: results, keyword: keyword, page: page, pagecount: pcount, count: count });

    });
  }

});

router.get('/search', function (req, res, next) {

  var page = req.query.page;
  var keyword = req.query.keyword;

  if (!_config.searchAccount || !keyword || !page) {
    res.render('search', { config: _config, results: null, keyword: null });
  } else {

    console.log("get '/search',", keyword);

    search.getSearchResult(page, keyword, function (err, resp, results, pcount, count) {

      //console.log(JSON.stringify(body));
      res.render('search', { config: _config, results: results, keyword: keyword, page: page, pagecount: pcount, count: count });

    });
  }

});

router.get('/upload', function (req, res, next) {

  res.render('upload', { config: _config });
});

module.exports = router;
