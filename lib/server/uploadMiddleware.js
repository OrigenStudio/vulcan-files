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
    console.log('req', req)
    // get fieles and fields from query, convert to dynamic JSON object to allow updates
    //const { files, fields } = await asyncBusboy(req);
    /*
    console.log("before", fields)
    /*
    fields.map = JSON.parse(fields.map)
    fields.operations = JSON.parse(fields.operations)
    /*

    // console.log('');
    // console.log('## graphqlUploadMiddleware ##########################################');

    // inject files in relevant fields
    files.forEach(file => {
      console.log(file.fieldname, typeof file.fieldname)
      const fieldName = file.fieldname
      const fieldPath = fields.map[fieldName][0]
      objectPath.set(fields, `operations.${fieldPath}`, file);
    });

    // back to strings
    */

    /*
    fields.map = JSON.stringify(fields.map)
    fields.operations = JSON.stringify(fields.operations)
    console.log("after", fields)
    /*
    /*
    req.body = fields//fields.data;

    // console.log('files:', files);
    // console.log('req:', req);
    */
  } catch (e) {
    // console.error('error:', e);
    return next(e);
  }
  return next();
}

addCallback('graphql.middlewares.setup', function useGqlUploadMiddleware(WebApp) {
  WebApp.connectHandlers.use('/graphql', graphqlUploadMiddleware);
})