import { Readable } from 'stream';
import get from 'lodash/get';

import { addFileFromReadable } from './helpers';

const createEditHandler = (fieldName, FSCollection, getValue) =>
  async function editHandler(modifier, document, currentUser) {
    const fieldValue = get(modifier, ['$set', fieldName]);
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
    return undefined;
  };

export default createEditHandler;
