// TODO refactor with createInsertHandler
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import mapValues from 'lodash/mapValues';
import randomstring from 'randomstring';
// import mkdirp from 'mkdirp';

// // TODO define path from settings
let filePath = `${path.resolve('.')}/assets/app/uploads/uploadedFiles/`;
// // create the file path
// FIXME is this is uncommented it breaks the upload! No idea why
// It needs to be enabled once to create the path
// mkdirp(filePath, error => {
//   if (error) {
//     console.error(error);
//   } else {
//     console.log(filePath, ' created');
//   }
// });

const createInsertHandler = (attribute, FSCollection) =>
  function insertHandler(document, currentUser) {
    const rstream = document[attribute];
    if (rstream instanceof Readable) {
      // TODO investigate of the rstream deletes the files
      return new Promise((resolve, reject) => {
        // -----------------------------------------------------
        // I am not sure this is required... the rstream already contains a path to a file.
        // Not sure whether the file in the path is completely uploaded to the server.
        // -----------------------------------------------------
        // Generate temporary file path
        filePath = `${filePath}wstream_${randomstring.generate()}_${
          rstream.filename
        }`;
        // Create a writable stream to where store the path
        const wstream = fs.createWriteStream(filePath);
        // Stream the file and save it....
        rstream.pipe(wstream);
        // When the file is finally written and saved we'll add it to the collection
        // The collection method will delete the temporary files
        // -----------------------------------------------------
        wstream.on('finish', args => {
          FSCollection.addFile(
            filePath,
            {
              fileName: rstream.filename,
            },
            (error, file) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  _id: file._id,
                  _collectionName: file._collectionName,
                  filename: rstream.filename, // TODO get name from file?
                  path: mapValues(file.versions, (version, versionName) => {
                    const link = FSCollection.link(file, versionName);
                    // The domain is removed
                    // It is added at the resolver  
                    return link.replace(/^.*\/\/[^\/]+/, '');
                  }),
                });
              }
            },
            true
          );
        });
      });
    }
    return rstream;
  };

export default createInsertHandler;
