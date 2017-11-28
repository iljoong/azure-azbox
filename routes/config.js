module.exports = {

    "accountName": process.env.BLOB_ACCNAME,
    "accountKey": process.env.BLOB_ACCKEY,
    "connectionString": process.env.STRCONN,
    "containerName" : process.env.BLOB_CONTAINER,

    // search api
    "searchAccount": process.env.SCH_ACCNAME,
    "searchApiKey": process.env.SCH_ACCKEY,
    "schDatasource": "doc-datasource",
    "schIndex": "doc-index",
    "schIndexer": "doc-indexer",

    "pageSize": process.env.PAGE_SIZE || 20,
    
    "expireday": 7
};

