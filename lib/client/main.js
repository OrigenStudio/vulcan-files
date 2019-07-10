import { registerTerminatingLink } from 'meteor/vulcan:lib';
import { createUploadLink } from 'apollo-upload-client';

registerTerminatingLink(createUploadLink())


export * from '../modules';
export { default as generateFieldSchema } from '../modules/generateFieldSchemaBase';
export { default as createFSCollection } from './createFSCollectionStub';

