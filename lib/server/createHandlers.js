import createInsertHandler from './createInsertHandler';
import createEditHandler from './createEditHandler';
import createInsertHandlerMultiple from './createInsertHandlerMultiple';
import createEditHandlerMultiple from './createEditHandlerMultiple';

export default function createHandlers(options) {
  const {
    fieldName,
    FSCollection,
    multiple = false,
    getValue = file => file._id,
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
