import { Readable } from 'stream';

import { addFileFromReadable } from './helpers';

const createInsertHandler = (fieldName, FSCollection, getValue) =>
  async function insertHandler(document, currentUser) {
    const fieldValue = document[fieldName];
    if (fieldValue instanceof Readable) {
      return getValue(await addFileFromReadable(FSCollection, fieldValue));
    }
    return fieldValue;
  };

export default createInsertHandler;
