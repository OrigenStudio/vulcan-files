import { GraphQLSchema, getSetting } from 'meteor/vulcan:lib';
import DataLoader from 'dataloader';
import { FilesCollection } from 'meteor/ostrio:files';
import {
  curryProcessImagesAndUpload,
  curryDeleteDocsAndFiles,
} from 'meteor/origenstudio:files-helpers';

import setFSCollectionHooks from './setFSCollectionHooks';

/**
 * Create a FSCollection.
 *
 * @param {Object} options
 *  Non documented options will be passed to `FilesCollection` constructor.
 * @param {Object=} options.storageProvider
 *  Storage provider, that contains methods to handle how files are stored
 *  in a third party
 * @param {Function=} options.storageProvider.serve
 *  Function to serve a file form a 3rd party.
 *  Signature of the function is `(http, fileRef, version):Boolean`
 * @param {Function=} options.storageProvider.upload
 *  Function to upload the file to a 3rd party once it is inserted to the files collection.
 *  Signature of the function is `(FilesCollection, docId, versionRef):Promise<File>`
 * @param {Function=} options.delete
 *  Function to delete the file from a 3rd party once it is removed from the files collection.
 *  Signature of the function is `(FilesCollection, docId, versionRef):Promise<File>`
 * @param {Object[]} options.fileProcessingRequests
 * @return {FilesCollection}
 */
export default function createFSCollection(options = {}) {
  const {
    storageProvider,
    fileProcessingRequests,
    collectionName,
    typeName = collectionName,
    ...FSOptions
  } = options;

  const FSCollection = new FilesCollection({
    debug: getSetting('debug', false),
    storagePath: 'assets/app/uploads/uploadedFiles',
    collectionName,
    ...FSOptions,
  });

  // define properties expected from a Vulcan Collection
  FSCollection.typeName = typeName;
  FSCollection.options = {
    ...(FSCollection.options || {}),
    collectionName,
  };

  if (storageProvider) {
    if (storageProvider.serve) {
      FSCollection.interceptDownload = storageProvider.serve;
    }

    if (storageProvider.upload) {
      // FIXME use non image specific functions
      const documentsProcessAndUpload = curryProcessImagesAndUpload(
        storageProvider.upload,
        fileProcessingRequests,
      );
      FSCollection.addListener('afterUpload', fileRef => {
        documentsProcessAndUpload(FSCollection, fileRef);
      });
    }

    if (storageProvider.delete) {
      const documentFilesDeleteDocsAndFiles = curryDeleteDocsAndFiles(
        storageProvider.delete,
      );
      // Intercept File's collection remove method to remove file from S3
      const FSCollection$remove = FSCollection.remove;
      FSCollection.remove = search => {
        documentFilesDeleteDocsAndFiles(FSCollection, FSCollection$remove, search);
      };
    }
  }

  setFSCollectionHooks(FSCollection);

  FSCollection.loader = new DataLoader(async ids => {
    const documents = FSCollection.find({ _id: { $in: ids } }).fetch();
    return ids.map(id => documents.find(doc => doc._id === id));
  });

  GraphQLSchema.addToContext({ [collectionName]: FSCollection });

  return FSCollection;
}
