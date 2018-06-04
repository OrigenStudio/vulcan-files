# Still Beta!

Provides Vulcan with the ability to upload files to the server and store them using [Meteor-Files](https://github.com/VeliovGroup/Meteor-Files).

## 1. Installation

### Vulcan dependency

This package requires Vulcan `1.11.0` or greater.

### Install the package

In your project's root folder run:
`meteor add origenstudio:vulcan-files`

### NPM dependencies

To avoid using `Npm.depends` this package does not include any NPM module, so you will have to install them yourself.

Here you have a list of the packages and versions required, so you can add them to your project's `package.json`:

```json
{
    "async-busboy": "^0.6.2",
    "brackets2dots": "^1.1.0",
    "lodash": "^4.0.0",
    "object-path": "^0.11.4",
    "randomstring": "^1.1.5",
    "react-dropzone": "^3.12.2",
    "recursive-iterator": "^3.3.0"
}
```

Make sure you run `meteor npm install`.

## 2. Usage

### 2.1. Create FSCollection

One problem of directly working with [Meteor-Files](https://github.com/VeliovGroup/Meteor-Files) is that files collection can only be created in a server context. This module exports a `createFSCollection` function both on the server and client (the latter is just a stub) so it can be called anywhere.

```js
import { createFSCollection } from 'meteor/origenstudio:vulcan-files';

const MyFSCollection = createFSCollection({
  collectionName: 'MyFSCollection',
  // ...other FilesCollection options
});

if (Meteor.isClient) {
  console.log(MyFSCollection); //-> undefined
}
```

### 2.2. Add a field to a schema

This module provides a `generateFieldSchema` function that will handle many of the problematics of adding a file field, while allowing you to customize (almost) all of its features.

```js
// TODO add documentation, see `Vulcanstagram` example for now
```

### 2.3. Uploading to 3rd parties

Right now only Amazon S3 is supported.

#### 2.3.1 Amazon S3

You can create an S3 client easily with the `createS3Client` function: you only need to provide it your bucket configuration and your CloudFront domain. As always, a stub function is exported in client so you can use this function anywhere.

Since you'll want to have your S3 configuration in your settings, you can retrieve them with Vulcan's `getSetting` function.

```json
{
  "amazonAWSS3": {
    "mainBucket": {
      "cfdomain": "https://yourdomain.cloudfront.net",
      "client": {
        "key": "",
        "secret": "",
        "region": "eu-west-1",
        "bucket": "your-bucket-name"
      }
    }
  }
}
```

Now you can create the S3 client from your settings:

```js
import { getSetting } from 'meteor/vulcan:core';
import { createS3Client } from 'meteor/origenstudio:vulcan-files';

// make sure the path of the settings match your own!
const s3Client = createS3Client(
  getSetting('amazonAWSS3.mainBucket.client'),
  getSetting('amazonAWSS3.mainBucket.cfdomain'),
);

if (Meteor.isClient) {
  // is empty object so you can safely retrieve properties from it
  console.log(s3Client); //-> {}
}

```

Once you have your client, you can use it to provide the 3rd party function that `createFSCollection` expects:

```js
const MyFilesS3 = createFSCollection({
  collectionName: 'MyFilesS3',
  uploadTo3rdParty: s3Client.upload,
  deleteFrom3rdParty: s3Client.delete,
})
```

## 3. Examples

### 3.1. Vulcanstagram

This example uses the Vulcan `example-instagram` as base. You find it [here](https://github.com/OrigenStudio/vulcan-files-simple-example).

Features:

- single file
- uses default field's value behavior, so only the file id is stored
- resolves only the file url
- images will be uploaded to `S3` if config is provided
