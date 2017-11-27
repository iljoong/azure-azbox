# AzBox

AzBox is a simple file share service using Azure blob storage and Azure search.
It makes file sharing using fileshare link and one can set expiry day (default is 7 days) of the link.

## Configure blob storage

1. Create an Azure storage account

2. Create a new container

3. Add storage account name, key and connection string in `/routes/config.js` or set environment variable

## Enable Search service

1. Create an Azure search

2. Add `search account name` and `api key` in `/routes/config.js` or set environment variable

3. Use AzBox portal to setup search service
    click `setup` tab or browse `/setup`

Note that AzBox works without search service

## Run

```
npm install
npm start
```

## Deploy to Azure Webapp

You can deploy this source to Azure Webapp.
It is recommended to configure `easyauth` for security

## Reference

https://docs.microsoft.com/en-us/azure/search/search-howto-indexing-azure-blob-storage