/**
 * Stolen from vulcan:forms. Modified to work with GraphQL `File` scalars.
 */
import getContext from "recompose/getContext";
import upperFirst from "lodash/upperFirst";
import map from "lodash/map";
import reject from "lodash/reject";
import isEmpty from "lodash/isEmpty";
import reduce from "lodash/reduce";
import get from "lodash/get";
import isString from "lodash/get";
import stubTrue from "lodash/stubTrue";
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import "isomorphic-fetch"; // patch for browser which don't have fetch implemented
import { withComponents, registerComponent } from "meteor/vulcan:core";
import withProps from "recompose/withProps";
import { injectIntl } from "react-intl";
import { compose } from "recompose";

// Visual components
const UploadInputLayout = ({ children }) => <div>{children}</div>;
const UploadInputLabel = ({ label }) => (
  <div style={{ marginBottom: "16px" }}>{upperFirst(label)}</div>
);
const UploadInputDropZoneContent = ({ selectOrDropFilesMessage }) => (
  <div>
    {selectOrDropFilesMessage}
    {/* Translate */}
  </div>
);
const UploadInputErrorMessage = ({ errorMessage }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      color: "red",
    }}
  >
    <span>{errorMessage}</span>
  </div>
);

// Full input
const UploadInput = (props) => {
  const {
    FileRender,
    selectOrDropFilesMessage = "Drop a file here, or click to select an file to upload.",
    uploadingMessage = "Uploading…",

    label,
    value,
    enableMultiple,
    uploading,
    errorMessage,
    onDrop,
    preview,
    clearFile,
    dropZoneProps,
    Components,
    document,
  } = props;

  const {
    UploadInputLabel,
    UploadInputDropZoneContent,
    UploadInputErrorMessage,
    UploadInputLayout,
  } = Components;

  return (
    <UploadInputLayout>
      {label ? <UploadInputLabel label={label} /> : null}
      <div>
        <div>
          {isEmpty(value) || enableMultiple ? (
            <Dropzone
              //ref="dropzone"
              multiple={enableMultiple}
              onDrop={onDrop}
              // accept="image/*" // TODO also add this filtering
              className="dropzone-base"
              data-cy="dropzone"
              activeClassName="dropzone-active"
              rejectClassName="dropzone-reject"
              style={{
                minHeight: "100px",
                border: "2px dashed grey",
                marginTop: "4px",
                marginBottom: "4px",
                backgroundColor: "#e1e1e1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "darkslategrey",
                cursor: "pointer",
              }}
              {...dropZoneProps}
            >
              <UploadInputDropZoneContent
                selectOrDropFilesMessage={selectOrDropFilesMessage}
              />
            </Dropzone>
          ) : null}

          {!isEmpty(value) ? (
            <div className="upload-state">
              {uploading ? <span>{uploadingMessage}</span> : null}
              <div>
                {enableMultiple ? (
                  value.map((value, index) => (
                    <FileRender
                      {...props}
                      clearFile={clearFile}
                      key={isString(value) ? value : index}
                      index={index}
                      value={value}
                      {...preview(value, index)}
                    />
                  ))
                ) : (
                  <FileRender
                    clearFile={this.clearFile}
                    value={value}
                    {...props}
                    {...preview(value)}
                  />
                )}
              </div>
            </div>
          ) : null}
          {errorMessage ? (
            <UploadInputErrorMessage errorMessage={errorMessage} />
          ) : null}
        </div>
      </div>
    </UploadInputLayout>
  );
};
UploadInput.propTypes = {
  FileRender: PropTypes.any,

  selectOrDropFieldsMessage: PropTypes.string,
  uploadingMessage: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.any,
  enableMultiple: PropTypes.bool,

  preview: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  clearFile: PropTypes.func.isRequired,

  uploading: PropTypes.bool,
  errorMessage: PropTypes.string,

  dropZoneProps: PropTypes.object, // additionnal props passed to react-dropzone
};

/*
Remove the nth item from an array
*/
const removeNthItem = (array, n) => [
  ..._.first(array, n),
  ..._.rest(array, n + 1),
];

// Container with logic
/*
File Upload component
*/
class UploadInputContainer extends PureComponent {
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
    previewFromValue: () => "",
    previewFromFile: (value) => ({
      name: get(value, "name", ""),
      url: get(value, "preview", ""),
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
  onDrop = (files) => {
    // Reset error state
    this.setState({
      errorMessage: null,
    });

    // Check that files are valid
    const errors = reject(
      map(files, (file) => this.props.fileCheck(file)),
      (check) => check === true
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
        errorFilesTooBig = "your file is too big",
        errorFilesNotAllowedType = "your file type is invalid",
      } = this.props;

      this.setState({
        errorMessage: upperFirst(
          reduce(
            errors,
            (result, error) => {
              switch (error) {
                case "invalid-file-type":
                  return result + errorFilesNotAllowedType;
                case "exceed-max-allowed-size":
                  return result + errorFilesTooBig;
                default:
                  return null;
              }
            },
            ""
          )
        ), // TODO translate
      });
    }
  };

  /*
  Check the field's type to decide if the component should handle
  multiple file uploads or not
  */
  enableMultiple = () =>
    (get(this.props, "datatype.definitions[0].type") ||
      get(this.props, "datatype[0].type")) === Array;

  getValue = () => this.props.value || (this.enableMultiple() ? [] : "");

  /*
  Remove the file at `index` (or just remove file if no index is passed)
  */
  clearFile = (index) => {
    const value = this.enableMultiple()
      ? get(this.props.value, index)
      : this.props.value;
    if (!value) {
      return;
    }

    const url = get(this.preview(value, index), "url");
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
    return (
      this.props.previewFromValue(value, index, this.props) ||
      this.props.previewFromFile(value, index, this.props)
    );
  };

  render() {
    const {
      FileRender,
      selectOrDropFilesMessage,
      uploadingMessage,
      removeMessage,
      dropZoneProps = {},
      label,
      Components,
      document,
    } = this.props;

    const { uploading, errorMessage } = this.state;
    const { UploadInputInner } = Components;
    return (
      <UploadInputInner
        document={document}
        FileRender={FileRender}
        selectOrDropFilesMessage={selectOrDropFilesMessage}
        uploadingMessage={uploadingMessage}
        onDrop={this.onDrop}
        value={this.getValue()}
        uploading={uploading}
        enableMultiple={this.enableMultiple()}
        onDrop={this.onDrop}
        preview={this.preview}
        errorMessage={errorMessage}
        removeMessage={removeMessage}
        clearFile={this.clearFile}
        dropZoneProps={dropZoneProps}
        label={label}
      />
    );
  }
}

// add intel and context
const WrappedUploadInputContainer = compose(
  injectIntl,
  withProps(({ intl }) => ({
    selectOrDropFilesMessage: intl.formatMessage({
      id: "fileUpload.selectOrDropFilesMessage",
      defaultMessage: "Drop a file here, or click to select an file to upload.",
    }),

    uploadingMessage: intl.formatMessage({
      id: "fileUpload.uploadingMessage",
      defaultMessage: "Uploading...",
    }),
    errorFilesNotAllowedType: intl.formatMessage({
      id: "fileUpload.errorFilesNotAllowedType",
      defaultMessage: "your file type is invalid",
    }),
    errorFilesTooBig: intl.formatMessage({
      id: "fileUpload.errorFilesTooBig",
      defaultMessage: "your file is too big",
    }),
    removeMessage: intl.formatMessage({
      id: "fileUpload.remove",
      defaultMessage: "remove",
    }),
  })),
  getContext({
    updateCurrentValues: PropTypes.func,
    getDocument: PropTypes.func,
  })
)(UploadInputContainer);

// registeration
registerComponent({ name: "UploadInputLayout", component: UploadInputLayout });
registerComponent({ name: "UploadInputLabel", component: UploadInputLabel });
registerComponent({
  name: "UploadInputDropZoneContent",
  component: UploadInputDropZoneContent,
});
registerComponent({
  name: "UploadInputErrorMessage",
  component: UploadInputErrorMessage,
});
registerComponent({
  name: "UploadInputInner",
  component: UploadInput,
  hocs: [withComponents],
});
export default registerComponent({
  name: "UploadInput",
  component: WrappedUploadInputContainer,
  hocs: [withComponents],
});
