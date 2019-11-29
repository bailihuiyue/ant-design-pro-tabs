import React, { Component } from 'react';
import router from 'umi/router';
import { formatMessage } from 'umi-plugin-react/locale';
import { Tabs } from 'antd';
import storage from 'good-storage';
import styles from './pageTsx.less';

const { TabPane } = Tabs;
const errorRoute = '/exception/404';

export interface TabPagesProps {
  location?: any,
  homePageKey: any,
  menuData?: any
  breadcrumbNameMap?: any
}

export interface TabPagesState {
  tabList: Object,
  activeKey: string,
  stateTabLists: any,
}

class TabPages extends Component<TabPagesProps, TabPagesState> {
  constructor(props: TabPagesProps) {
    super(props);
    this.state = {
      tabList: {},
      activeKey: '',
      stateTabLists: null,
    };
  }

  componentWillMount() {
    const {
      location: { pathname },
      homePageKey,
    } = this.props;
    const unClosedTabs = storage.session.get('AntTabs') || [homePageKey];
    const listObj = {};
    let txt = '';
    let words = '';
    unClosedTabs.forEach((key: any) => {
      if (words.indexOf('menu.') === -1) {
        txt = `menu${key.replace(/\//g, '.')}`;
        // words = formatMessage({ id: txt });
        let source = { [key]: { closable: key !== homePageKey, key, tab: txt, content: '' } };
        Object.assign(listObj, source);
        words = '';
      }
    });
    this.setState({
      tabList: listObj,
      activeKey: pathname === '/' ? homePageKey : pathname,
    });

    if (pathname === '/') {
      router.replace(homePageKey);
    }

    // window.onbeforeunload = () => ""; // 会导致在electron中无法刷新和切换页面
  }

  componentWillReceiveProps(nextProps: any) {
    this.renderTabs(nextProps);
    this.freshTabs(nextProps)

  }

  shouldComponentUpdate = (nextProps: TabPagesProps, nextState: TabPagesState) => {

    this.freshTabs(nextProps)
    return true;
  };

  freshTabs = (nextProps: TabPagesProps) => {
    if (nextProps.breadcrumbNameMap != null) {
      let {breadcrumbNameMap} = nextProps
      let tabList  = this.state.tabList // 引用类型直接更改
      for (let key in tabList) {
        if (breadcrumbNameMap[key]) {
          let menu = breadcrumbNameMap[key];
          tabList[key].tab = formatMessage({id:menu.locale});
        }
      }
    }

  };
  onChange = (key: any) => {
    this.setState({ activeKey: key });
    router.push(key);
  };

  onEdit = (targetKey: any, action: any) => {
    this[action](targetKey);
  };

  remove = (targetKey: any) => {
    let { activeKey } = this.state;
    const { tabList } = this.state;
    const tabListObj = { ...tabList };
    const tabKeys = Object.keys(tabList);
    let lastIndex = tabKeys.length - 1;
    let needRouterPush = false;
    delete tabListObj[targetKey];
    lastIndex -= 1;
    if (activeKey === targetKey) {
      activeKey = tabKeys[lastIndex];
      needRouterPush = true;
    }
    this.setState(
      {
        tabList: tabListObj,
        activeKey,
      },
      () => {
        storage.session.set('AntTabs', Object.keys(tabListObj));
        needRouterPush && router.push(activeKey);
      },
    );
  };

  updateTreeList = (data: any) => {
    const treeData = data || [];
    const treeList: any[] = [];
    const getTreeList = (tree: any) => {
      tree.forEach((node: any) => {
        if (!node.level) {
          Object.assign(treeList, {
            [node.path]: {
              tab: node.name,
              key: node.path,
              locale: node.locale,
              closable: true,
              content: '',
            },
          });
        }
        if (!node.hideChildrenInMenu && node.children && node.children.length > 0) {
          getTreeList(node.children);
        }
      });
    };
    getTreeList(treeData);

    return treeList;
  };

  renderTabs = (props: any) => {
    const {
      children,
      location: { pathname },
      menuData,
      errorPage,
    } = props;
    const { tabList, stateTabLists } = this.state;
    const tabLists = stateTabLists || this.updateTreeList(menuData);
    const listObj = { ...tabList };
    let path = pathname;
    // 该路由存在,但是tabs并没有
    if (tabLists[pathname] && !Object.keys(listObj).includes(pathname)) {
      tabLists[pathname].content = children;
      Object.assign(listObj, { [pathname]: tabLists[pathname] });
      // 刷新页面后,tab会重新打开,但是没有没有内容
    } else if (listObj[pathname] && !listObj[pathname].content) {
      listObj[pathname] = Object.assign(tabLists[pathname] || {}, { closable: listObj[pathname].closable });
      listObj[pathname].content = children;
      // 路由不存在,一般是在地址栏中输入了不存在的url
    } else if (!tabLists[pathname]) {
      if (!listObj[pathname]) {
        Object.assign(listObj, { [errorRoute]: { closable: true, key: errorRoute, tab: '无权限', content: errorPage } });
      }
      path = errorRoute;
    }

    if (!stateTabLists) {
      this.setState({ stateTabLists: tabLists });
    }
    this.setState(
      {
        activeKey: path,
        tabList: listObj,
      },
      () => {
        storage.session.set('AntTabs', Object.keys(listObj));
      },
    );
  };

  render() {
    const { tabList, activeKey } = this.state;
    return (
      <Tabs
        className={styles.content_tab}
        activeKey={activeKey}
        onChange={this.onChange}
        tabBarStyle={{ background: '#fff' }}
        tabPosition="top"
        hideAdd
        type="editable-card"
        tabBarGutter={-1}
        onEdit={this.onEdit}
      >
        {Object.keys(tabList).map(item => {
          const { tab, key, closable, content } = tabList[item];
          return (
            <TabPane tab={tab} key={key} closable={closable} className={styles.tabpane}>
              {content}
            </TabPane>
          );
        })}
      </Tabs>
    );
  }
}

export default TabPages;
