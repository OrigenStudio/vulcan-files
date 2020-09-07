/**
 * Create Vulcan field callbacks for file upload and edition
 */
import { addFileFromReadable } from "./helpers";

/**
 *
 * @param {*} getValue A serializable value representing the file, eg its id (Meteor Files) or its path on the server (Webdav)
 * @param {*} FSCollection A Meteor file collection OR any class with and addFileFromReadable method (eg for Next Cloud)
 * @param {*} fieldValue The file
 * @param {*} fileDocument The document being created alongside the file, containing the fields of our schema. Useful to compute
 * the file path dynamically
 */
const uploadFromField = async (
  getValue,
  FSCollection,
  fieldValue,
  fileDocument
) => {
  const file = await fieldValue;
  if (!file.createReadStream) return file;
  const addFileResult = await addFileFromReadable(
    FSCollection,
    file,
    fileDocument
  );
  return getValue(addFileResult);
};

/**
 * Retrieves the id of the file document in the FS Collection.
 *
 * @param {Object} file
 * @return {String}
 * @function createHandlers~defaultGetValue
 */
const defaultGetValue = (file) => file._id;

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

  const curryOnCreate = multiple ? createHandlerMultiple : createHandler;
  const curryOnUpdate = multiple ? updateHandlerMultiple : updateHandler;
  const curryOnDelete = multiple ? deleteHandlerMultiple : deleteHandler;

  return {
    onCreate: curryOnCreate(fieldName, FSCollection, getValue),
    onUpdate: curryOnUpdate(fieldName, FSCollection, getValue),
    onDelete: curryOnDelete(fieldName, FSCollection, getValue),
  };
}

export const createHandler = (fieldName, FSCollection, getValue) =>
  async function vulcanOnCreateHandler({ newDocument, currentUser }) {
    const fieldValue = newDocument[fieldName];
    if (fieldValue) {
      return uploadFromField(getValue, FSCollection, fieldValue, newDocument);
    }
    return undefined;
  };

export const createHandlerMultiple = (fieldName, FSCollection, getValue) =>
  async function vulcanOnCreateHandlerMultiple({ newDocument, currentUser }) {
    const fieldValues = newDocument[fieldName];
    if (Array.isArray(fieldValue)) {
      return uploadFromFields(getValue, FSCollection, fieldValues, newDocument);
    }
    return fieldValues;
  };

// if the user want to upload a file, the field will contain a promise
const hasUploadedFile = (fieldValue) => fieldValue && fieldValue.then;
const isEmpty = (fieldValue) => fieldValue === null;

const uploadFromFields = async (
  getValue,
  FSCollection,
  fieldValues,
  fileDocument
) => {
  return Promise.all(
    fieldValues
      .filter((fieldValue) => !!fieldValue) // filter out non defined values
      .map(async (fieldValue) => {
        return uploadFromField(
          getValue,
          FSCollection,
          fieldValue,
          fileDocument
        );
      })
  );
};
export const updateHandler = (fieldName, FSCollection, getValue) =>
  //TODO: this may break in version of Vulcan > 1.15. document contains a promise for the file (= the new document)
  async function vulcanOnUpdateHandler({
    data,
    oldDocument /*, document,currentUser */,
  }) {
    const fieldValue = data[fieldName];
    // null => file has been deleted or never existed in the first place
    // fieldValue.then is defined => field is a Promise, a new file has been added
    if (!(isEmpty(fieldValue) || hasUploadedFile(fieldValue))) return undefined; // no change or deletion
    // remove the old file (if appliable) whenever the field is modified (either updated to a new file or deleted)
    if (oldDocument[fieldName]) {
      const fileId = oldDocument[fieldName];
      const filePath = fileId;
      await FSCollection.remove(fileId, filePath);
    }
    // update new file (if there is a new file)
    if (fieldValue) {
      return await uploadFromField(getValue, FSCollection, fieldValue, data);
    }
    return undefined;
  };

export const updateHandlerMultiple = (fieldName, FSCollection, getValue) =>
  // TODO: not tested, not sure about the structure of "fieldValues" and how to detect deletion
  // Implementation considers that if one file of the list is modified, then
  // fieldValues will list all files
  async function vulcanOnUpdateHandler({
    data,
    oldDocument /*, currentUser*/,
  }) {
    const fieldValues = data[fieldName];
    if (
      !(
        isEmpty(fieldValues) ||
        _any(fieldValues, (fieldValue) => hasUploadedFile(fieldValue))
      )
    )
      return undefined; // no change or deletion
    // remove old files
    if (oldDocument[fieldName]) {
      const oldFileIds = oldDocument[fieldName];
      await Promise.all(
        oldFileIds.map((deletedFileId) => {
          const deletedFilePath = deletedFileId; // Meteor files uses fileId, while Webdav uses filePath
          FSCollection.remove(deletedFileId, deletedFilePath);
        })
      );
    }
    // create files
    if (fieldValues) {
      if (Array.isArray(fieldValues)) {
        return uploadFromFields(getValue, FSCollection, fieldValues, data);
      }
    }
    return undefined;
  };

export const deleteHandler = (fieldName, FSCollection) =>
  async function vulcanOnDeleteHandler({ document /*, currentUser*/ }) {
    const fieldValue = document[fieldName];
    // null => file has been deleted or never existed in the first place
    if (isEmpty(fieldValue)) return undefined; // no change or deletion
    // remove the old file (if appliable) whenever the field is modified (either updated to a new file or deleted)
    if (document[fieldName]) {
      const deletedFileId = document[fieldName]; // Id used by Meteor Files
      const deletedFilePath = deletedFilePath; // When NOT using Meteor files, document[fieldName] is actually the "filePath" field of the document
      await FSCollection.remove(deletedFileId, deletedFilePath);
    }
    return undefined;
  };

export const deleteHandlerMultiple = (fieldName, FSCollection, getValue) =>
  // TODO: not tested, not sure about the structure of "fieldValues" and how to detect deletion
  // Implementation considers that if one file of the list is modified, then
  // fieldValues will list all files
  async function vulcanOnDeleteHandler({ document /*, currentUser*/ }) {
    const fieldValues = document[fieldName];
    if (isEmpty(fieldValues)) return undefined; // no change or deletion
    // remove old files
    if (document[fieldName]) {
      const deletedFilesIds = document[fieldName];
      await Promise.all(
        deletedFilesIds.map((deletedFileId) => {
          const deletedFilePath = deletedFileId;
          FSCollection.remove(deletedFileId, deletedFilePath);
        })
      );
    }
    return undefined;
  };
