import createResolverMultiple from './createResolverMultiple';

export default function createResolverSingle(
  fieldName,
  FSCollection,
  resolveId,
) {
  const resolverMultiple = createResolverMultiple(
    fieldName,
    FSCollection,
    resolveId,
  );
  return async document => {
    const files = await resolverMultiple(document);
    return files[0] || null;
  }
}
