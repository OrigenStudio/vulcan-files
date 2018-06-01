import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import { injectIntl } from 'react-intl';

import Upload from '../components/Upload';

export default compose(
  injectIntl,
  withProps(({ intl }) => ({
    selectOrDropFilesMessage: intl.formatMessage({
      id: 'fileUpload.selectOrDropFilesMessage',
      defaultMessage: 'Drop a file here, or click to select an file to upload.',
    }),

    uploadingMessage: intl.formatMessage({
      id: 'fileUpload.uploadingMessage',
      defaultMessage: 'Uploading...',
    }),
    errorFilesNotAllowedType: intl.formatMessage({
      id: 'fileUpload.errorFilesNotAllowedType',
      defaultMessage: 'your file type is invalid',
    }),
    errorFilesTooBig: intl.formatMessage({
      id: 'fileUpload.errorFilesTooBig',
      defaultMessage: 'your file is too big',
    }),
    removeMessage: intl.formatMessage({
      id: 'remove',
      defaultMessage: 'remove'
    }),
  }))
)(Upload);
