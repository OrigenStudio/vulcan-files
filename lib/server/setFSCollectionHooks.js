import { runCallbacks } from 'meteor/vulcan:lib';

const executeHooks = (value, hooks) => hooks.reduce(
  (iterator, hook) => runCallbacks({ ...hook, iterator }),
  value,
);

export default function setFSCollectionHooks(FSCollection) {
  const baseProperties = { collection: FSCollection };
  FSCollection.addListener('afterUpload', fileRef => {
    return executeHooks(fileRef, [
      {
        name: '*.upload.after',
        properties: baseProperties,
      },
      {
        name: `${FSCollection.typeName}.upload.after`.toLowerCase(),
        properties: baseProperties,
      },
    ]);
  });
}
