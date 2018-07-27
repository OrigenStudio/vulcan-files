import castArray from 'lodash/castArray';
import compact from 'lodash/compact';

export default function createResolverMultiple(
    fieldName,
    FSCollection,
    resolveId,
) {
  return async document => {
    const fileIds = compact(castArray(document[fieldName])).map(resolveId);
    if (fileIds.length === 0) return [];

    const files = await FSCollection.loader.loadMany(fileIds);
    return compact(files);
  };
}
