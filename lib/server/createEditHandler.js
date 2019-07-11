import { Readable } from 'stream';

import { addFileFromReadable } from './helpers';

const createEditHandler = (fieldName, FSCollection, getValue) =>
  async function editHandler(modifier, document, currentUser) {
    console.log("edit", document)
    if (modifier.$set && modifier.$set[fieldName]) {
      const fieldValue = await modifier.$set[fieldName];
      return fieldValue.createReadStream
        ? getValue(await addFileFromReadable(FSCollection, fieldValue.createReadStream()))
        : fieldValue;
    }
    return undefined;
  };

export default createEditHandler;
