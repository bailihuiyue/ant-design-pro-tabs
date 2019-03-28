import React, { PureComponent } from 'react';
import styles from './index.less';

export default class Home extends PureComponent {
  render() {
    return (
      <div className={styles.content}>
        <h2>欢迎使用Ant Design Pro Tabs</h2>
        <h2>欢迎交流</h2>
      </div>
    );
  }
}
