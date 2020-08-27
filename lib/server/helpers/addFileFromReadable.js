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
export default function addFileFromReadable(FSCollection, readable) {
  return new Promise(async (resolve, reject) => {
    const data = await streamToBuffer(readable); // We have to get the whole file, no way to stream to FS
    // When the file is finally written and saved we'll add it to the collection
    // The collection method will delete the temporary files
    // -----------------------------------------------------
    FSCollection.write(
      data,
      { fileName: readable.filename },
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
}
