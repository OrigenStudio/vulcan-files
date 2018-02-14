import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import { withIntlFormatMessage } from 'meteor/zetoff:vulcan';

import Upload from '../components/Upload';

export default compose(
  withIntlFormatMessage(),
  withProps(({ formatMessage }) => ({
    selectOrDropFilesMessage: formatMessage({
      id: 'fileUpload.selectOrDropFilesMessage',
      defaultMessage: 'Drop a file here, or click to select an file to upload.',
    }),

    uploadingMessage: formatMessage({
      id: 'fileUpload.uploadingMessage',
      defaultMessage: 'Uploading...',
    }),
    errorFilesNotAllowedType: formatMessage({
      id: 'fileUpload.errorFilesNotAllowedType',
      defaultMessage: 'your file type is invalid',
    }),
    errorFilesTooBig: formatMessage({
      id: 'fileUpload.errorFilesTooBig',
      defaultMessage: 'your file is too big',
    }),
    removeMessage: formatMessage({
      id: 'remove',
      defaultMessage: 'remove'
    }),
  }))
)(Upload);
