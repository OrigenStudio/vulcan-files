import { withRenderContext } from 'meteor/vulcan:lib';
import { fileUploadMiddleware } from './interface';

export * from '../modules';
export { default as createFSCollection } from './createFSCollectionStub';
export { default as createS3Client } from './createS3ClientStub';

Meteor.startup(() => {
  withRenderContext(renderContext => {
    renderContext.apolloClient.networkInterface.use([fileUploadMiddleware]);
  });
});
