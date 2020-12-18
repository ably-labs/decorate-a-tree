# festive2020

Happy festive season everyone 🎄

As we roll into the end of 2020, you might be missing the joy of decorating trees together, all 2020s considered. So for a little festive cheer, decorate a tree together, in real time.

Just drag and drop decorations onto your tree! It's saved automatically, and you can share a tree with your friends and family.

You can put decorations you don't want anymore back in the box, and double clicking on the decoration box will clear the tree.

Temp URL: https://red-smoke-0543b3b03.azurestaticapps.net/

# Technical notes on how this is built

* Uses the browsers native drag and drop support for UI elements (take a look in DraggableImageCollection and DraggableImage for details)
* Uses Ably Realtime messaging to send updates when people change the tree
* Uses Windows Azure Blob Storage to persist tree state
* Uses Azure Static Web Apps for hosting

Drag and drop support is provided natively by the browser - which unfortunately means this doesn't work great on mobile browsers, but it's an interesting dive if you're curious how draggable UIs can work on the desktop.

# Running locally

If you want to run this locally, you'll need some API keys for Ably and Azure, node, and a couple of NPM packages.

# Dependencies

- An Ably API key
- An Azure Account for hosting on production
- Node 12 (LTS)

# Configuring Ably

We're going to need to configure our system for local development, and to do that we need to

- Install the azure-functions-core-tools
- Add our Ably API key to a configuration file
- Configure a function to provide the Ably SDK with `token authentication` credentials

## Ably Channels for pub/sub

The app uses [Ably](https://www.ably.io/) for [pub/sub messaging](https://www.ably.io/documentation/core-features/pubsub) between the players. Ably is an enterprise-ready pub/sub messaging platform that makes it easy to design, ship, and scale critical realtime functionality directly to your end-users.

[Ably Channels](https://www.ably.io/channels) are multicast (many publishers can publish to many subscribers) and we can use them to build apps.

## Ably channels and API keys

In order to run this app, you will need an Ably API key. If you are not already signed up, you can [sign up now for a free Ably account](https://www.ably.io/signup). Once you have an Ably account:

1. Log into your app dashboard.
2. Under **“Your apps”**, click on **“Manage app”** for any app you wish to use for this tutorial, or create a new one with the “Create New App” button.
3. Click on the **“API Keys”** tab.
4. Copy the secret **“API Key”** value from your Root key, we will use this later when we build our app.

This app is going to use [Ably Channels](https://www.ably.io/channels) and [Token Authentication](https://www.ably.io/documentation/rest/authentication/#token-authentication).

## Local dev pre-requirements

We'll use snowpack to serve our static files and Azure functions for interactivity

```bash
npm install -g azure-functions-core-tools
```

Set your API key for local dev:

```bash
cd api
func settings add ABLY_API_KEY Your-Ably-Api-Key
```

Running this command will encrypt your API key into the file `/api/local.settings.json`.
You don't need to check it in to source control, and even if you do, it won't be usable on another machine.

Next you'll need to [Create an Azure Blob Storage Account](https://azure.microsoft.com/en-gb/services/storage/blobs/?&OCID=AID2100128_SEM_XqK-bwAAAfw50RTJ:20200812092318:s&msclkid=3cef80961050146d866fdfa5a5531dc2&ef_id=XqK-bwAAAfw50RTJ:20200812092318:s&dclid=CLKMy-irlesCFTwWBgAdZdYGKA), create a container, and a storage bucket, and generate an API key.

Please refer to the Azure docs for this. Once you know all your Azure configuration, you can either edit your `local.settings.json` file by hand, or add to it using the `func` command as above. You'll need to add the following keys:

```bash
AZURE_ACCOUNT
AZURE_CONTAINERNAME
AZURE_BLOBSTORAGE
AZURE_KEY
```

An example, unencrypted, settings file looks like this:

```js
{
  "IsEncrypted": false,
  "Values": {
    "ABLY_API_KEY": "ably-api-key-here",
    "AZURE_ACCOUNT": "festive2020",
    "AZURE_CONTAINERNAME": "trees",
    "AZURE_BLOBSTORAGE": "https://festive2020.blob.core.windows.net",
    "AZURE_KEY": "some-azure-access-token-from-the-storage-account",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  },
  "ConnectionStrings": {}
}
```

## How to run for local dev

Run the app:

```bash
npm install
npm run start
```

## How authentication with Ably works

Azure static web apps don't run traditional "server side code", but if you include a directory with some Azure functions in your application, Azures deployment engine will automatically create and manage Azure functions for you, that you can call from your static application.

For local development, we'll just use the Azure functions SDK to replicate this, but for production, we can use static files (or files created by a static site generator of your choice) and Azure will serve them for us.

## In the Azure function

We have a folder called API which contains an Azure functions JavaScript API. There's a bunch of files created by default (package.json, host.json etc) that you don't really need to worry about, and are created by the Functions SDK. If you wanted to expand the API, you would use npm install and the package.json file to manage dependencies for any addtional functions.

There's a directory `api/createTokenRequest` - this is where all our "server side" code lives.

Inside it, there are two files - `index.js` and `function.json`. The function.json file is the Functions binding code that the Azure portal uses for configuration, it's generated by the SDK and you don't need to pay attention to it. Our Ably code is inside the `index.js` file.

```js
const Ably = require('ably/promises');

module.exports = async function (context, req) {
    const client = new Ably.Realtime(process.env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'ably-whiteboard' });
    context.res = { 
        headers: { "content-type": "application/json" },
        body: JSON.stringify(tokenRequestData)
    };
};
```

By default, configures this API to be available on `https://azure-url/api/createTokenRequest`
We're going to provide this URL to the Ably SDK in our client to authenticate with Ably.