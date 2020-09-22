import defaultResolveId from "../modules/defaultResolveId";
import castArray from "lodash/castArray";
import compact from "lodash/compact";

/**
 * Creates field's resolver to retrieve the file.
 *
 * @param {Object} options Options
 * @param {String} options.fieldName
 *  Field name
 * @param {String} options.FSCollection
 *  FSCollection where to store the uploaded files as documents
 * @param {Boolean=} options.multiple=false
 *  Whether the field will be multiple or not
 * @param {Function=} options.resolveId=defaultResolveId
 *  Function used to retrieve the file id from the stored value in the file
 *  field in the document. Defaults to {@link defaultResolveId}
 * @return {Function} resolver
 */
export default function createResolver(options) {
  const {
    fieldName,
    FSCollection,
    multiple = false,
    resolveId = defaultResolveId,
  } = options;

  return multiple
    ? createResolverMultiple(fieldName, FSCollection, resolveId)
    : createResolverSingle(fieldName, FSCollection, resolveId);
}

function createResolverMultiple(fieldName, FSCollection, resolveId) {
  return async (document) => {
    const fileIds = compact(castArray(document[fieldName])).map(resolveId);
    if (fileIds.length === 0) return [];

    const files = await FSCollection.loader.loadMany(fileIds);
    return compact(files);
  };
}

function createResolverSingle(fieldName, FSCollection, resolveId) {
  const resolverMultiple = createResolverMultiple(
    fieldName,
    FSCollection,
    resolveId
  );
  return async (document) => {
    const files = await resolverMultiple(document);
    return files[0] || null;
  };
}
