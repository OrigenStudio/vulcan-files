/*
Display a single file
*/
import React, { PureComponent } from 'react';
import { Components } from 'meteor/vulcan:lib';

class BasicFile extends PureComponent {
  clearFile = e => {
    e.preventDefault();
    this.props.clearFile(this.props.index);
  };

  render() {
    const { removeMessage = 'remove' } = this.props;

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '16px' }}>{this.props.name}</span>
        <a href="javascript:void(0)" onClick={this.clearFile}>
          {removeMessage}
        </a>
      </div>
    );
  }
}

export default BasicFile;
