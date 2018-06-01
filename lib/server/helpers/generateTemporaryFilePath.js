import randomstring from 'randomstring';

import getFileBasePath from './getFileBasePath';

export default ({ filename }) =>
  `${getFileBasePath()}wstream_${randomstring.generate()}_${filename}`;
