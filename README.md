# Still Beta!

Provides Vulcan with the ability to upload files to the server and store them using [Meteor-Files](https://github.com/VeliovGroup/Meteor-Files).

## 1. Installation

### Vulcan dependency

This package requires Vulcan `1.11.0` or greater.

### Install the package

In your project's root folder run:
`meteor add origenstudio:vulcan-files`

### NPM dependencies

To avoid using `Npm.depends` this package does not include any NPM module, so you will have to install them yourself by running the following command:

```
meteor npm install gm@^1.23.1 lodash@^4.0.0 randomstring@^1.1.5 react-dropzone@^3.12.2 recursive-iterator@^3.3.0 apollo-upload-client@^11.0.0
```

Alternatively, here you have a list of the packages and versions required, so you can add them to your project's `package.json`:

```json
{
    "gm": "^1.23.1",
    "lodash": "^4.0.0",
    "randomstring": "^1.1.5",
    "react-dropzone": "^3.12.2",
    "recursive-iterator": "^3.3.0",
    "apollo-upload-client": "^11.0.0"
}
```

Make sure you run `meteor npm install`.

## 2. Usage

### 2.1. Create FSCollection

One problem of directly working with [Meteor-Files](https://github.com/VeliovGroup/Meteor-Files) is that files collection can only be created in a server context. This module exports a `createFSCollection` function both on the server and client (the latter is just a stub) so it can be called anywhere.

```js
import { createFSCollection } from 'meteor/origenstudio:vulcan-files';

const MyFSCollection = createFSCollection({
  typeName: 'MyFSTypeName', // optional, defaults to `collectionName`
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

### 2.3. Callback hooks

#### 2.3.1. Upload hooks

##### After upload

Two hooks are executed when a file has been uploaded: 

- `*.upload.after`: runs for all collections 
- `{typename}.upload.after`: runs with the uploaded file type name

Signature of callbacks added to these hooks:

```
(fileDocument, { FSCollection }) => fileDocument
```

Note that these hooks won't reflect any change on the file document (as it has already been saved), but it can be useful to perform side effects.

### 2.4. Uploading to 3rd parties

This package provides an easy integration with third party services, though it does not include any out of the box. You can integrate with you preferred 3rd party service by using one of the following packages:

- Amazon S3: [origenstudio:vulcan-files-s3](https://github.com/OrigenStudio/vulcan-files-s3)

##### Creating custom integrations

You can integrate with your own third party storage provider by setting the `storageProvider` option when creating the files collection. It should have the following shape:

```js
const storageProvider = {
  /**
   * Called when a document is inserted, and it should be used to upload the file
   * into the storage provider.
   * 
   * @param {Collection} FSCollection
   *  Meteor Files collection
   * @param {string} documentId
   *  Id of the inserted file document
   * @param {Object} versionRef
   *  Information of the version of the file being uploaded
   * @return {Promise<any>}
   */
  upload: async (FSCollection, documentId, versionRef) => versionRef,
  /**
   * Called when a document is deleted, and it should be used to delete the file
   * from the storage provider.
   * 
   * @param {Collection} FSCollection
   *  Meteor Files collection
   * @param {string} documentId
   *  Id of the file document being deleted
   * @param {Object} versionRef
   *  Information of the version of the file being deleted
   * @return {Promise<any>}
   * @throws Error if could not delete file
   */
  delete: async (FSCollection, documentId, versionRef) => versionRef,
  /**
   * Called when a document is requested to be served, and it should be used to
   * serve the file from the storage provider.
   * 
   * Note that by returning `false` the standard behavior will be resumed, and
   * it should be done when the file has not been uploaded (ex: during upload).
   * 
   * @param {object} http
   *  Middleware request instance, as provided by Meteor Files
   * @param {object} fileRef
   *  The fileRef of the document to be served
   * @param {string} version
   *  The version name of the document to be served
   * @return {Boolean}
   *  `true` to intercept request, `false` to continue standard behaviour
   */
  serve: (http, fileRef, version) => false,
};
```

## 3. Examples

### 3.1. Vulcanstagram

This example uses the Vulcan `example-instagram` as base. You find it [here](https://github.com/OrigenStudio/vulcan-files-simple-example).

Features:

- single file
- uses default field's value behavior, so only the file id is stored
- images will be uploaded to `S3` if config is provided
