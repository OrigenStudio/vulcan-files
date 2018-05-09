import createInsertHandler from './createInsertHandler';
import createEditHandler from './createEditHandler';
import createInsertHandlerMultiple from './createInsertHandlerMultiple';
import createEditHandlerMultiple from './createEditHandlerMultiple';

/**
 * Retrieves the id of the file document.
 *
 * @param {Object} file
 * @return {String}
 * @function createHandlers~defaultGetValue
 */
const defaultGetValue = file => file._id;

/**
 * Creates field's insert and edit handlers.
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
 * @return {{onInsert: Function, onEdit: Function}}
 */
export default function createHandlers(options) {
  const {
    fieldName,
    FSCollection,
    multiple = false,
    getValue = defaultGetValue,
  } = options;

  const curryOnInsert = multiple
    ? createInsertHandlerMultiple
    : createInsertHandler;
  const curryOnEdit = multiple ? createEditHandlerMultiple : createEditHandler;

  return {
    onInsert: curryOnInsert(fieldName, FSCollection, getValue),
    onEdit: curryOnEdit(fieldName, FSCollection, getValue),
  };
}
