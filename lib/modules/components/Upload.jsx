/**
 * Stolen from vulcan:forms. Modified to work with GraphQL `File` scalars.
 */
import getContext from 'recompose/getContext';
import upperFirst from 'lodash/upperFirst';
import map from 'lodash/map';
import reject from 'lodash/reject';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import get from 'lodash/get';
import isString from 'lodash/get';
import stubTrue from 'lodash/stubTrue';
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
    fileCheck: PropTypes.func,
    FileRender: PropTypes.func.isRequired,
    previewFromValue: PropTypes.func,
    previewFromFile: PropTypes.func,
  };

  static defaultProps = {
    fileCheck: stubTrue,
    previewFromValue: () => '',
    previewFromFile: value => ({
      name: get(value, 'name', ''),
      url: get(value, 'preview', ''),
    }),
  };


  constructor(props, context) {
    super(props, context);

    this.state = {
      uploading: false,
      errorMessage: null,
    };
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
      this.props.updateCurrentValues({
        [this.props.name]: this.enableMultiple()
          ? [...this.getValue(), ...files]
          : files[0],
      });
    } else {
      // TODO better error handling
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
  enableMultiple = () => (
    get(this.props, 'datatype.definitions[0].type') ||
    get(this.props, 'datatype[0].type')
  ) === Array;

  getValue = () => this.props.value || (this.enableMultiple() ? [] : '');

  /*
  Remove the file at `index` (or just remove file if no index is passed)
  */
  clearFile = index => {
    const value = this.enableMultiple()
      ? get(this.props.value, index)
      : this.props.value;
    if (!value) {
      return;
    }

    const url = get(this.preview(value, index), 'url');
    if (url) {
      window.URL.revokeObjectURL(url);
    }

    this.props.updateCurrentValues({
      [this.props.name]: this.enableMultiple()
        ? removeNthItem(this.props.value, index)
        : null,
    });
  };

  preview = (value, index = null) => {
    return this.props.previewFromValue(value, index, this.props) ||
      this.props.previewFromFile(value, index, this.props);
  };

  render() {
    const {
      FileRender,
      selectOrDropFilesMessage = 'Drop a file here, or click to select an file to upload.',
      uploadingMessage = 'Uploading…',
      ...props
    } = this.props;
    const value = this.getValue();
    const { uploading } = this.state;

    return (
      <div style={{ padding: '12px 16px' }}>
        {this.props.label ? (
          <div style={{ marginBottom: '16px' }}>
            {upperFirst(this.props.label)}
          </div>
        ) : null}
        <div>
          <div>
            {isEmpty(value) || this.enableMultiple() ? (
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

            {!isEmpty(value) ? (
              <div className="upload-state">
                {uploading ? <span>{uploadingMessage}</span> : null}
                <div>
                  {this.enableMultiple() ? (
                    value.map((value, index) => (
                      <FileRender
                        {...props}
                        clearFile={this.clearFile}
                        key={isString(value) ? value : index}
                        index={index}
                        value={value}
                        {...this.preview(value, index)}
                      />
                    ))
                  ) : (
                    <FileRender
                      clearFile={this.clearFile}
                      value={value}
                      {...props}
                      {...this.preview(value)}
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

export default getContext({
  updateCurrentValues: PropTypes.func,
  getDocument: PropTypes.func,
})(Upload);
