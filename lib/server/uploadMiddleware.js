import { webAppConnectHandlersUse } from 'meteor/vulcan:lib';
import objectPath from 'object-path';
import brackets2Dots from 'brackets2dots';
import asyncBusboy from 'async-busboy';

function isUpload(req) {
  return (
    req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')
  );
}

async function graphqlUploadMiddleware(req, res, next) {
  try {
    if (!isUpload(req)) {
      return next();
    }
    const { files, fields } = await asyncBusboy(req);

    // console.log('');
    // console.log('## graphqlUploadMiddleware ##########################################');

    files.forEach(file => {
      objectPath.set(fields, brackets2Dots(file.fieldname), file);
    });
    req.body = fields.data;

    // console.log('files:', files);
    // console.log('req:', req);
  } catch (e) {
    // console.error('error:', e);
    return next(e);
  }
  return next();
}

Meteor.startup(() => {
  webAppConnectHandlersUse('graphql-upload-middleware', '/graphql', graphqlUploadMiddleware, {
    order: 1
  });
});
