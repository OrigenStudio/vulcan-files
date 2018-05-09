import './uploadMiddleware';
import './addGraphQLSchemaAndResolvers';

export { createS3Client } from 'meteor/origenstudio:files-helpers';
export * from '../modules';
export { default as createFSCollection } from './createFSCollection';
export { default as createInsertHandler } from './createInsertHandler';
export { default as createEditHandler } from './createEditHandler';
export { default as createHandlers } from './createHandlers';
