/*
Display a single image
*/
import React, { PureComponent } from 'react';
import { Components } from 'meteor/vulcan:lib';

class Image extends PureComponent {
  clearImage = e => {
    e.preventDefault();
    this.props.clearFile(this.props.index);
  };

  render() {
    const { removeMessage = 'remove' } = this.props;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          style={{ height: 160, marginRight: '16px' }}
          src={this.props.url}
          alt={this.props.name}
        />
        <a href="javascript:void(0)" onClick={this.clearImage}>
          {removeMessage}
        </a>
      </div>
    );
  }
}

export default Image;
