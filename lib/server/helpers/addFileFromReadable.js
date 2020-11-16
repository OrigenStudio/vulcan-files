import util from "util";
const streamToBuffer = (readable) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("error", (err) => reject(err));
    readable.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
    readable.on("data", (chunk) => {
      chunks.push(chunk);
    });
  });

import fs from "fs";
import randomstring from "randomstring";
import getFileBasePath from "./getFileBasePath";
const generateTemporaryFilePath = ({ filename }) =>
  `${getFileBasePath()}wstream_${randomstring.generate()}_${filename}`;

export default async function addFileFromReadable(
  FSCollection,
  file,
  fileDocument
) {
  if (FSCollection.constructor.name === "FilesCollection") {
    return new Promise((resolve, reject) => {
      // -----------------------------------------------------
      // I am not sure this is required... the rstream already contains a path to a file.
      // Not sure whether the file in the path is completely uploaded to the server.
      // -----------------------------------------------------
      // Generate temporary file path
      const filePath = generateTemporaryFilePath(file);
      // Create a writable stream to where store the path
      const wstream = fs.createWriteStream(filePath);
      // Stream the file and save it....
      file.pipe(wstream);
      // When the file is finally written and saved we'll add it to the collection
      // The collection method will delete the temporary files
      // -----------------------------------------------------
      // NOTE: we have to use addFile, so that the "afterUpload" callback is correctly called
      // (in case you are using a 3rd party provider such as s3)
      // Using "write" DOESN'T seem to trigger this callback
      wstream.on("finish", (args) => {
        FSCollection.addFile(
          filePath,
          { fileName: file.filename },
          (error, file) => {
            if (error) {
              reject(error);
            } else {
              resolve(file);
            }
          },
          true
        );
      });
    });
  }

  const readable = file.createReadStream();
  // For custom collections that support addFileFromReadable
  if (!!FSCollection.addFileFromReadable) {
    return await FSCollection.addFileFromReadable(readable, file, fileDocument);
  } else if (!!FSCollection.addFileFromBuffer) {
    const data = await streamToBuffer(readable); // We have to get the whole file, no way to stream to FS
    return await FSCollection.addFileFromBuffer(data, file, fileDocument);
  } /*
    This code is not used, because calling "write" will not trigger the "afterUpload" callback
    For Vulcan-files to work with 3rd party packages, we instead need to call "addFile", see code above
  else {
    // Legacy code for actual Meteor Files FSCollection, can't work with stream directly so we need to create a buffer in-memory
    // (for big files we could store on disk but that won't work well)
    const data = await streamToBuffer(readable); // We have to get the whole file, no way to stream to FS
    //const write = util.promisify(FSCollection.write);
    // return await write(data, file);
    return new Promise((resolve, reject) =>
      FSCollection.write(data, file, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      })
    );
  }*/
}
