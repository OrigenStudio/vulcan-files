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
meteor npm install async-busboy@^0.6.2 brackets2dots@^1.1.0 lodash@^4.0.0 object-path@^0.11.4 randomstring@^1.1.5 react-dropzone@^3.12.2 recursive-iterator@^3.3.0 knox@^0.9.2 gm@^1.23.1
```

Alternatively, here you have a list of the packages and versions required, so you can add them to your project's `package.json`:

```json
{
    "async-busboy": "^0.6.2",
    "brackets2dots": "^1.1.0",
    "gm": "^1.23.1",
    "knox": "^0.9.2",
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

## 3. Examples

### 3.1. Vulcanstagram

This example uses the Vulcan `example-instagram` as base. You find it [here](https://github.com/OrigenStudio/vulcan-files-simple-example).

Features:

- single file
- uses default field's value behavior, so only the file id is stored
- images will be uploaded to `S3` if config is provided
