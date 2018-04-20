/*
Display a single file
*/
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Components } from 'meteor/vulcan:lib';

class BasicFile extends PureComponent {
  clearFile = e => {
    e.preventDefault();
    this.props.clearFile(this.props.index);
  };

  getFileName() {
    const { preview, file } = this.props;
    return get(preview, 'name') || get(file, 'name');
  }

  render() {
    const { removeMessage = 'remove' } = this.props;

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '16px' }}>{this.getFileName()}</span>
        <a href="javascript:void(0)" onClick={this.clearFile}>
          {removeMessage}
        </a>
      </div>
    );
  }
}

export default BasicFile;
