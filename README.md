# AzBox

AzBox is a simple file share service using Azure blob storage and Azure search.
It makes file sharing using fileshare link and one can set expiry day (default is 7 days) of the link.

![AzBox](./azbox.gif)

## Configure blob storage

1. Create an Azure storage account

2. Create a new container

4. Add **'Allowed Origin'** in CORS setting

    - You can add `*` for Dev/Test but it is recommend to add 'website url' for production

5. Add storage account name, key and connection string in `/routes/config.js` or set environment variable

## Enable Search service

You can enable text search with built-in indexer in Azure Search [1]

1. Create an Azure search

2. Add `search account name` and `api key` in `/routes/config.js` or set environment variable

3. Use AzBox portal to setup search service
    click `setup search service` link in the front page or browse `/setup`

Note that AzBox works without search service

## Run (local test)

```
npm install
npm start
```

browse `http://localhost:3000`

## Deploy to Azure Webapp

You can deploy this source to Azure Webapp.
It is recommended to configure `auth/authz` settings for security [2]

## TODO

Directory browsing

## Reference

[1] https://docs.microsoft.com/en-us/azure/search/search-howto-indexing-azure-blob-storage

[2] https://azure.microsoft.com/en-us/blog/announcing-app-service-authentication-authorization/