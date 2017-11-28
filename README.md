# AzBox

AzBox is a simple file share service using Azure blob storage and Azure search.
It makes file sharing using fileshare link and one can set expiry day (default is 7 days) of the link.

![AzBox](./azbox.png)

## Configure blob storage

1. Create an Azure storage account

2. Create a new container

3. Add storage account name, key and connection string in `/routes/config.js` or set environment variable

## Enable Search service

You can enable text search with built-in indexer in Azure Search [1]

1. Create an Azure search

2. Add `search account name` and `api key` in `/routes/config.js` or set environment variable

3. Use AzBox portal to setup search service
    click `setup` tab or browse `/setup`

Note that AzBox works without search service

## Run (local test)

```
npm install
npm start
```

browse `http://localhost:3000`

## Deploy to Azure Webapp

You can deploy this source to Azure Webapp.
It is recommended to configure `auth/authz for AAD` for security [2]

## Reference

[1] https://docs.microsoft.com/en-us/azure/search/search-howto-indexing-azure-blob-storage

[2] https://azure.microsoft.com/en-us/blog/announcing-app-service-authentication-authorization/