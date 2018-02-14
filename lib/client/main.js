import { withRenderContext } from 'meteor/vulcan:lib';
import { fileUploadMiddleware } from './interface';

export * from '../modules';

Meteor.startup(() => {
  withRenderContext(renderContext => {
    renderContext.apolloClient.networkInterface.use([fileUploadMiddleware]);
  });
});
