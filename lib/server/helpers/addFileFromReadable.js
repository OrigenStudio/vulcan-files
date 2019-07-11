import fs from 'fs';

import generateTemporaryFilePath from './generateTemporaryFilePath';

export default function addFileFromReadable(FSCollection, readable) {
  return new Promise((resolve, reject) => {
    // -----------------------------------------------------
    // I am not sure this is required... the rstream already contains a path to a file.
    // Not sure whether the file in the path is completely uploaded to the server.
    // -----------------------------------------------------
    // Generate temporary file path
    const filePath = generateTemporaryFilePath(readable);
    console.log("filePath", filePath)
    // Create a writable stream to where store the path
    const wstream = fs.createWriteStream(filePath);
    // Stream the file and save it....
    readable.pipe(wstream);
    // When the file is finally written and saved we'll add it to the collection
    // The collection method will delete the temporary files
    // -----------------------------------------------------
    wstream.on('finish', args => {
      console.log("adding file to FSCollection")
      FSCollection.addFile(
        filePath,
        { fileName: readable.filename },
        (error, file) => {
          if (error) {
            reject(error);
          } else {
            resolve(file);
          }
        },
        true,
      );
    });
  });
}