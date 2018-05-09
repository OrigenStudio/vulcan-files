# Still Beta!

Provides Vulcan with the ability to upload files to the server and store them using [Meteor-Files](https://github.com/VeliovGroup/Meteor-Files).

## 1. Installation

### Vulcan dependency

This package requires Vulcan `1.10.2` or greater.

If you're working with a previous `1.10.x` version, you must install it locally and apply the changes of this [PR](https://github.com/VulcanJS/Vulcan/pull/1982).

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

This example uses the Vulcan `example-instagram@1.10.0` (you can download it from [Vulcan-Starter](https://github.com/VulcanJS/Vulcan-Starter)) as base and explains how it can be adapted in order to use `origenstudio:vulcan-files`.

Features:

- single file
- uses default field's value behavior, so only the file id is stored
- resolves only the file url
- images will be uploaded to `S3`

#### 3.1.0. Setup

Add your Amazon S3 configuration in your project settings with the following structure and fill the blanks:

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

#### 3.1.1. Create FSCollection: PicsFiles

Create file `packages/example-instagram/lib/modules/pics/fsCollection.js`:

```js
import { getSetting } from 'meteor/vulcan:core';
import { createS3Client, createFSCollection } from 'meteor/origenstudio:vulcan-files';

const s3Client = createS3Client(
  getSetting('amazonAWSS3.mainBucket.client'),
  getSetting('amazonAWSS3.mainBucket.cfdomain'),
);

export default createFSCollection({
  collectionName: 'PicsFiles',
  uploadTo3rdParty: s3Client.upload,
  deleteFrom3rdParty: s3Client.delete,
});

```

#### 3.1.2. Generate field schema

Modify `packages/example-instagram/lib/modules/pics/schema.js`:

```js
// add this to the top of the file
import once from 'lodash/once';
import isString from 'lodash/isString';
import { curryFileCheck } from 'meteor/origenstudio:files-helpers';
import { generateFieldSchema, Image } from 'meteor/origenstudio:vulcan-files';

import PicsFiles from './fsCollection';

const schema = {
  // replace the entire `imageUrl` field
  ...generateFieldSchema({
    FSCollection: PicsFiles,
    // only the file id will be stored: this is the default behavior, so we do not
    // need to specify the fieldType
    fieldName: 'imageId',
    fieldSchema: {
      label: 'Image URL',
      form: {
        // perform file validation checks
        fileCheck: once(() => curryFileCheck({
          maxSize: 5 * 1024 * 1024, // 5Mbytes
          fileTypeRegExp:  /png|jpg|jpeg/i,
        })),
        // we want the file to be shown as an image: this package already provides
        // a component for that purpose
        FileRender: once(() => Image),
        // `previewFromValue` function is called before rendering a file, and allow us to tell
        // the FileRender component how it should be previewed. In this case, we want to
        // pass the value of the resolved field as the url
        previewFromValue: once(() => (value, index, props) => {
          if (isString(value)) {
            // is the stored value (id of the file document)
            return {
              // retrieve url from resolved field
              url: props.document.imageUrl,
              // we do not have the name of the file here, so we'll set it
              // from the document's body field
              // this is entirely optional and it is only used as the `alt`
              // attribute of the `img` tag
              name: props.currentValues.body || props.document.body,
            };
          } else {
            // File object as provided by the input, do nothing: preview will be 
            // retrieved automatically by `previewFromFile` prop
          }
        }),
      },
    },
    resolverName: 'imageUrl',
    // we only need to add the resolver on the server, so we check if PicsFiles exist
    resolver: PicsFiles
      ? async ({ imageId }) => {
          if (!imageId) {
            return null;
          }
          const imageFile = await PicsFiles.loader.load(imageId);
          return imageFile ? PicsFiles.link(imageFile) : null;
        }
      : null,
  }),
  // end of the replacement
};

```

#### 3.1.3. Update fragment and retrieve data in form

By using the `generateFieldSchema` to create the field we have actually added 2 fields: `imageId` that stores the id of the file in the `PicsFiles` collection and the `imageUrl` resolved field. For the latter we don't have to do anything since it already existed before we changed anything, but the first will have to be added into the corresponding fragments so it is retrieved when querying the document.

We only need this field when updating the document, so we will add it to the `PicsDetailsFragment` registered in `packages/example-instagram/lib/modules/pics/fragments.js` file:

```js
registerFragment(/* GraphQL */`
  fragment PicsDetailsFragment on Pic {
    _id
    createdAt
    userId
    user {
      displayName
    }
    imageId # retrieve id to update document
    imageUrl
    commentsCount
    body
  }
`);
```

Now we will have to use this fragment in the edit form, so we'll have to edit the `packages/example-instagram/lib/components/pics/PicsEditForm.jsx` file and provide the `queryFragment` prop to `Components.SmartForm`:

```jsx
  <Components.SmartForm 
    collection={Pics}
    documentId={documentId}
    queryFragment={getFragment('PicsDetailsFragment')} // add this line
    mutationFragment={getFragment('PicsDetailsFragment')}
    showRemove={true}
    successCallback={document => {
      closeModal();
    }}
  />
```
