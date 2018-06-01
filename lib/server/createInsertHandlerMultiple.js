import { Readable } from 'stream';

import { addFileFromReadable } from './helpers';

export default function createInsertHandlerMultiple(
  fieldName,
  FSCollection,
  getValue,
) {
  return async function insertHandlerMultiple(document, currentUser) {
    const fieldValue = document[fieldName];
    if (Array.isArray(fieldValue)) {
      return Promise.all(
        fieldValue.map(async value => {
          if (value instanceof Readable) {
            return getValue(await addFileFromReadable(FSCollection, value));
          }
          return Promise.resolve(value);
        }),
      );
    }
    return fieldValue;
  };
}
