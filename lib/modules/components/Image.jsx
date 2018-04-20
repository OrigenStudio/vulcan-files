/*
Display a single image
*/
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Components } from 'meteor/vulcan:lib';

/*
Get a URL from an image or an array of images
*/
const getImageUrl = imageOrImageArray => {
  // if image is actually an array of formats, use first format
  const image = Array.isArray(imageOrImageArray)
    ? imageOrImageArray[0]
    : imageOrImageArray;
  // if image is an object, return secure_url; else return image itself
  return typeof image === 'string' ? image : image.url || image.preview;
};

class Image extends PureComponent {
  clearImage = e => {
    e.preventDefault();
    this.props.clearFile(this.props.index);
  };

  getImageUrl = () => {
    return getImageUrl(this.props.preview || this.props.file);
  };

  render() {
    const { removeMessage = 'remove' } = this.props;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          style={{ height: 160, marginRight: '16px' }}
          src={this.getImageUrl()}
          alt="uploaded"
        />
        <a href="javascript:void(0)" onClick={this.clearImage}>
          {removeMessage}
        </a>
      </div>
    );
  }
}

export default Image;
