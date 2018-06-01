import { Readable } from 'stream';

import { addFileFromReadable } from './helpers';

const createEditHandler = (fieldName, FSCollection, getValue) =>
  async function editHandler(modifier, document, currentUser) {
    if (modifier.$set && modifier.$set[fieldName]) {
      const fieldValue = modifier.$set[fieldName];
      return fieldValue instanceof Readable
        ? getValue(await addFileFromReadable(FSCollection, fieldValue))
        : fieldValue;
    }
    return undefined;
  };

export default createEditHandler;
