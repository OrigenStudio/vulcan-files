import { addCallback } from 'meteor/vulcan:core';
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
    console.log("run middleware")
    if (!isUpload(req)) {
      return next();
    }
    console.log("isUpload")
    const { files, fields } = await asyncBusboy(req);
    fields.map = JSON.parse(fields.map)
    console.log(fields.operations)
    fields.operations = JSON.parse(fields.operations)
    console.log("files", files, Object.keys(fields), typeof fields.map, typeof fields.operations)

    // console.log('');
    // console.log('## graphqlUploadMiddleware ##########################################');

    files.forEach(file => {
      console.log(file.fieldname, typeof file.fieldname)
      const fieldName = file.fieldname
      const fieldPath = fields.map[fieldName][0]
      console.log(fieldPath)
      console.log(fields.map, fields.map[file.fieldname])
      objectPath.set(fields, `operations.${fieldPath}`, file);
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

addCallback('graphql.middlewares.setup', function useGqlUploadMiddleware(WebApp) {
  WebApp.connectHandlers.use('/graphql', graphqlUploadMiddleware);
})