/**
 * Create Vulcan field callbacks for file upload and edition
 */
import { Readable } from 'stream';
import { addFileFromReadable } from './helpers';

/**
 * Retrieves the id of the file document.
 *
 * @param {Object} file
 * @return {String}
 * @function createHandlers~defaultGetValue
 */
const defaultGetValue = file => file._id;

/**
 * Creates field's create and update handlers.
 *
 * @param {Object} options Options
 * @param {String} options.fieldName
 *  Field name
 * @param {String} options.FSCollection
 *  FSCollection where to store the uploaded files as documents
 * @param {Boolean=} options.multiple=false
 *  Whether the field will be multiple or not
 * @param {Function=} options.getValue=createHandlers~defaultGetValue
 *  Function used to retrieve the value that will be stored in the field from
 *  the file document. Default to {@link createHandlers~defaultGetValue}
 * @return {{onCreate: Function, onUpdate: Function}}
 */
export default function createUploadHandlers(options) {
  const {
    fieldName,
    FSCollection,
    multiple = false,
    getValue = defaultGetValue,
  } = options;

  const curryOnCreate = multiple
    ? createHandlerMultiple
    : createHandler;
  const curryOnUpdate = multiple ? updateHandlerMultiple : updateHandler;

  return {
    onCreate: curryOnCreate(fieldName, FSCollection, getValue),
    onUpdate: curryOnUpdate(fieldName, FSCollection, getValue),
  };
}


export const createHandler = (fieldName, FSCollection, getValue) =>
  async function createHandler({ newDocument, currentUser }) {
    const fieldValue = newDocument[fieldName];
    if (fieldValue instanceof Readable) {
      return getValue(await addFileFromReadable(FSCollection, fieldValue));
    }
    return fieldValue;
  };

export const createHandlerMultiple = (
  fieldName,
  FSCollection,
  getValue,
) =>
  async function createHandlerMultiple({ newDocument, currentUser }) {
    const fieldValue = newDocument[fieldName];
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


export const updateHandler = (fieldName, FSCollection, getValue) =>
  async function updateHandler({ data, document, currentUser }) {
    if (typeof data[fieldName] === 'undefined') return undefined // no change
    if (!data[fieldName]) {
      // TODO trigger file removal
    } else {
      const fieldValue = await data[fieldName];
      return fieldValue.createReadStream
        ? getValue(await addFileFromReadable(FSCollection, fieldValue.createReadStream()))
        : fieldValue;
    }
    return undefined;
  };

export const updateHandlerMultiple = (fieldName, FSCollection, getValue) =>
  async function updateHandler({ data, document, currentUser }) {
    if (typeof data[fieldName] === 'undefined') return undefined // no change
    if (!data[fieldName]) {
      // TODO trigger file removal
    } else {
      const fieldValue = data[fieldName];
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
    }
    return undefined;
  };