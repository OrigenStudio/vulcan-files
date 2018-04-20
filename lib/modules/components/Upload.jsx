/**
 * Stolen from vulcan:forms. Modified to work with GraphQL `File` scalars.
 */
import upperFirst from 'lodash/upperFirst';
import map from 'lodash/map';
import reject from 'lodash/reject';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import 'isomorphic-fetch'; // patch for browser which don't have fetch implemented
/*
Remove the nth item from an array
*/
const removeNthItem = (array, n) => [
  ..._.first(array, n),
  ..._.rest(array, n + 1),
];

/*
File Upload component
*/
class Upload extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.any,
    label: PropTypes.string,
  };

  static contextTypes = {
    addToAutofilledValues: PropTypes.func,
    getDocument: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);

    const { previewUrl = () => '' } = props.options || {};
    const preview = this.enableMultiple()
      ? (props.value || []).map((file, index) => ({
          name: file.filename,
          url: previewUrl(file, index, props),
        }))
      : {
          name: props.value.filename,
          url: previewUrl(props.value, 0, props),
        };
    const isEmpty = this.enableMultiple()
      ? props.value.length === 0
      : !props.value && !preview;
    const emptyValue = this.enableMultiple() ? [] : '';

    this.state = {
      preview,
      uploading: false,
      value: isEmpty ? emptyValue : props.value,
      errorMessage: null,
    };
  }

  /*
  Add to autofilled values so SmartForms doesn't think the field is empty
  if the user submits the form without changing it
  */
  componentWillMount() {
    const isEmpty = this.enableMultiple()
      ? this.props.value.length === 0
      : !this.props.value;
    const emptyValue = this.enableMultiple() ? [] : '';
    this.context.addToAutofilledValues({
      [this.props.name]: isEmpty ? emptyValue : this.props.value,
    });
  }

  /*
  When an file is uploaded
  */
  onDrop = files => {
    // Reset error state
    this.setState({
      errorMessage: null,
    });

    // Check that files are valid
    const errors = reject(
      map(files, file => this.props.fileCheck(file)),
      check => check === true
    );
    // TODO add max files

    if (isEmpty(errors)) {
      // set the component in upload mode with the preview
      this.setState(
        {
          preview: this.enableMultiple()
            ? [
                ...(this.state.preview || {}),
                ...files.map(file => ({
                  name: file.name,
                  url: file.preview,
                })),
              ]
            : { name: files[0].name, url: files[0].preview },
          value: this.enableMultiple()
            ? [...this.state.value, ...files]
            : files[0],
        },
        () => {
          // tell vulcanForm to catch the value
          this.context.addToAutofilledValues({
            [this.props.name]: this.state.value,
          });
        }
      );
    } else {
      // Set error message
      const {
        errorFilesTooBig = 'your file is too big',
        errorFilesNotAllowedType = 'your file type is invalid',
      } = this.props;

      this.setState({
        errorMessage: upperFirst(
          reduce(
            errors,
            (result, error) => {
              switch (error) {
                case 'invalid-file-type':
                  return result + errorFilesNotAllowedType;
                case 'exceed-max-allowed-size':
                  return result + errorFilesTooBig;
                default:
                  return null;
              }
            },
            ''
          )
        ), // TODO translate
      });
    }
  };

  /*
  Check the field's type to decide if the component should handle
  multiple file uploads or not
  */
  enableMultiple = () => this.props.datatype.definitions[0].type === Array;

  /*
  Remove the file at `index` (or just remove file if no index is passed)
  */
  clearFile = index => {
    window.URL.revokeObjectURL(
      this.enableMultiple()
        ? this.state.preview[index].url
        : this.state.preview.url
    );
    const newValue = this.enableMultiple()
      ? removeNthItem(this.state.value, index)
      : '';
    this.context.addToAutofilledValues({ [this.props.name]: newValue });
    this.setState({
      preview: newValue,
      value: newValue,
    });
  };

  render() {
    const {
      FileRender,
      selectOrDropFilesMessage = 'Drop a file here, or click to select an file to upload.',
      uploadingMessage = 'Uploading…',
      ...props
    } = this.props;
    const { uploading, preview, value } = this.state;
    // show the actual uploaded file or the preview
    const fileData = preview.url ? preview : value;

    return (
      <div style={{ padding: '12px 16px' }}>
        {this.props.label ? (
          <div style={{ marginBottom: '16px' }}>
            {upperFirst(this.props.label)}
          </div>
        ) : null}
        <div>
          <div>
            {isEmpty(fileData) || this.enableMultiple() ? (
              <Dropzone
                ref="dropzone"
                multiple={this.enableMultiple()}
                onDrop={this.onDrop}
                // accept="image/*" // TODO also add this filtering
                className="dropzone-base"
                activeClassName="dropzone-active"
                rejectClassName="dropzone-reject"
                style={{
                  minHeight: '100px',
                  backgroundColor: 'lightgrey',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: 'darkslategrey',
                  cursor: 'pointer',
                }}
              >
                <div>
                  {selectOrDropFilesMessage}
                  {/* Translate */}
                </div>
              </Dropzone>
            ) : null}

            {!isEmpty(fileData) ? (
              <div className="upload-state">
                {uploading ? <span>{uploadingMessage}</span> : null}
                <div>
                  {this.enableMultiple() ? (
                    fileData.map((file, index) => (
                      <FileRender
                        clearFile={this.clearFile}
                        key={index}
                        index={index}
                        file={file}
                        preview={this.state.preview[index]}
                        {...props}
                      />
                    ))
                  ) : (
                    <FileRender
                      clearFile={this.clearFile}
                      file={fileData}
                      preview={this.state.preview}
                      {...props}
                    />
                  )}
                </div>
              </div>
            ) : null}
            {this.state.errorMessage ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  color: 'red',
                }}
              >
                <span>{this.state.errorMessage}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Upload;
