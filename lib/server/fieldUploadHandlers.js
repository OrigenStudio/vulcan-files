/**
 * Create Vulcan field callbacks for file upload and edition
 */
import { Readable } from 'stream';
import { addFileFromReadable } from './helpers';

const uploadFromField = async (getValue, FSCollection, fieldValue) => {
  const file = await fieldValue
  if (!file.createReadStream) return file
  const addFileResult = await addFileFromReadable(FSCollection, file.createReadStream())
  return getValue(addFileResult)
}


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
    if (fieldValue) {
      return uploadFromField(getValue, FSCollection, fieldValue)
    }
    return undefined
  };

export const createHandlerMultiple = (
  fieldName,
  FSCollection,
  getValue,
) =>
  async function createHandlerMultiple({ newDocument, currentUser }) {
    const fieldValues = newDocument[fieldName];
    if (Array.isArray(fieldValue)) {
      return uploadFromFields(getValue, FSCollection, fieldValues)
    }
    return fieldValues;
  };



// if the user want to upload a file, the field will contain a promise
const hasUploadedFile = fieldValue => fieldValue && fieldValue.then
const isEmpty = fieldValue => fieldValue === null

export const updateHandler = (fieldName, FSCollection, getValue) =>
  async function updateHandler({ data, document, currentUser, oldDocument }) {
    const fieldValue = data[fieldName]
    // null => file has been deleted or never existed in the first place
    // fieldValue.then is defined => field is a Promise, a new file has been added
    if (!(isEmpty(fieldValue) || hasUploadedFile(fieldValue))) return undefined // no change or deletion
    // remove the old file (if appliable) whenever the field is modified (either updated to a new file or deleted)
    if (oldDocument[fieldName]) {
      // TODO: remove previous value
      const fileId = oldDocument[fieldName]
      await FSCollection.remove(fileId)
    }
    // update new file (if there is a new file)
    if (fieldValue) {
      return await uploadFromField(getValue, FSCollection, fieldValue)
    }
    return undefined;
  };

const uploadFromFields = async (getValue, FSCollection, fieldValues) => {
  return Promise.all(
    fieldValues
      .filter(fieldValue => !!fieldValue) // filter out non defined values
      .map(async fieldValue => {
        return uploadFromField(getValue, FSCollection, fieldValue)
      })
  );
}
export const updateHandlerMultiple = (fieldName, FSCollection, getValue) =>
  // TODO: not tested, not sure about the structure of "fieldValues" and how to detect deletion
  // Implementation considers that if one file of the list is modified, then 
  // fieldValues will list all files
  async function updateHandler({ data, document, currentUser }) {
    const fieldValues = data[fieldName]
    if (!(isEmpty(fieldValues) || _any(fieldValues, fieldValue => hasUploadedFile(fieldValue)))) return undefined // no change or deletion
    // remove old files
    if (oldDocument[fieldName]) {
      const oldFileIds = oldDocument[fieldName]
      await Promise.all(oldFileIds.map(FSCollection.remove))
    }
    // create files
    if (fieldValues) {
      if (Array.isArray(fieldValues)) {
        return uploadFromFields(getValue, FSCollection, fieldValues)
      }
    }
    return undefined;
  };