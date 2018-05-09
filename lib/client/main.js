import { withRenderContext } from 'meteor/vulcan:lib';
import { fileUploadMiddleware } from './interface';

export * from '../modules';
export { default as createFSCollection } from './createFSCollectionStub';

Meteor.startup(() => {
  withRenderContext(renderContext => {
    renderContext.apolloClient.networkInterface.use([fileUploadMiddleware]);
  });
});
