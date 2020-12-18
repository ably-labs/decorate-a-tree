const { StorageSharedKeyCredential, BlobServiceClient } = require("@azure/storage-blob");

checkConfig(["AZURE_ACCOUNT", "AZURE_KEY", "AZURE_BLOBSTORAGE", "AZURE_CONTAINERNAME"]);

module.exports = async function (context, req) {
    const unique = `${req.body.id}.json`;
    const fileData = JSON.stringify(req.body);
    const buffer = Buffer.from(fileData, "utf8");

    const url = await saveToAzure(unique, buffer, "application/json");

    console.log(req.body);

    context.res = {
        headers: { "content-type": "application/json" },
        body: { result: "success" }
    };
};

async function saveToAzure(filename, buffer, mimeType) {

    if (!filename) {
        throw "Cannot save to Azure as no filename was provided.";
    }

    if (!buffer) {
        throw "No data to save to Azure. Buffer is undefined.";
    }

    const containerName = process.env.AZURE_CONTAINERNAME;

    const unique = filename;
    const url = `${process.env.AZURE_BLOBSTORAGE}/${containerName}/${unique}`;

    if (process.env.SKIP_AZURE_UPLOADS) {
        return "skipped";
    }

    const defaultAzureCredential = new StorageSharedKeyCredential(process.env.AZURE_ACCOUNT, process.env.AZURE_KEY);
    const blobServiceClient = new BlobServiceClient(process.env.AZURE_BLOBSTORAGE, defaultAzureCredential);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const options = mimeType ? { blobHTTPHeaders: { blobContentType: mimeType } } : {};

    const blockBlobClient = containerClient.getBlockBlobClient(unique);
    const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length || 0, options);

    return url;
}

function checkConfig(requiredConfiguration) {
    const missingKeys = requiredConfiguration.filter(key => !process.env[key] || (process.env[key].length <= 0));
    const anyMissing = missingKeys.length > 0;

    if (anyMissing) {
        throw `Your Azure Functions configuration is missing the following configuration setting(s):\r\n${missingKeys.join(', ')}\r\n
        If you're in a development environment, make sure you have a configuration file in /api/local.settings.json with these keys configured:
        ${requiredConfiguration.join(', ')}\r\n
        
        If you see this message while deployed to Azure, make sure you've configured your Application Settings - https://docs.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings \r\n
        If you see this message locally, you can learn more about local.settings.json here - https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=windows%2Ccsharp%2Cbash#local-settings-file`;
    }
}