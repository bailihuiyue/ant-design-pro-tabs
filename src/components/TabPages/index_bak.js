import React, { useState, useEffect, useRef } from 'react';
import { history, useIntl } from 'umi';
import { Tabs } from 'antd';
import storage from 'good-storage';
import styles from './page.less';

const { TabPane } = Tabs;
const errorRoute = '/error';

const TabPages = (props) => {
  //   const [tabList, setTabList] = useState({});
  const [activeKey, setActiveKey] = useState('');
  // 用作缓存,避免每次都渲染树
  const [stateTabLists, setStateTabLists] = useState('');
  const [needRouterPush, setNeedRouterPush] = useState(false);
  const intl = useIntl();
  let listObj = {};
  const tabListRef = useRef({});

  const transforPathToTxt = (path, node) => {
    if (node?.children?.length || node?.redirect) {
      return path;
    }
    if (path) {
      const txt = `menu${path.replace(/\//g, '.')}`;
      return intl.formatMessage({ id: txt });
    }
  };

  useEffect(() => {
    const {
      location: { pathname },
      homePageKey,
    } = props;
    const unClosedTabs = storage.session.get('AntTabs') || [homePageKey];
    const listObjTemp = {};
    unClosedTabs.forEach((key) => {
      Object.assign(listObjTemp, {
        [key]: { key, tab: transforPathToTxt(key), content: '' },
      });
    });
    tabListRef.current = listObjTemp;
    // setTabList(listObjTemp);
    // setStateTabLists(listObjTemp);
    setActiveKey(pathname === '/' ? homePageKey : pathname);

    if (pathname === '/') {
      history.replace(homePageKey);
    }

    // window.onbeforeunload = () => '';
  }, []);

  const updateTreeList = (data) => {
    const treeData = data;
    const treeList = [];
    const getTreeList = (tree) => {
      tree.forEach((node) => {
        if (!node.level) {
          Object.assign(treeList, {
            [node.path]: {
              tab: transforPathToTxt(node.path, node),
              key: node.path,
              locale: node.locale,
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

  const renderTabs = () => {
    const {
      children,
      location: { pathname },
      errorPage,
      route: { routes },
    } = props;
    const tabLists = stateTabLists || updateTreeList(routes);
    listObj = { ...tabListRef.current };
    let path = pathname;
    // 该路由存在,但是tabs并没有
    if (tabLists[pathname] && !Object.keys(listObj).includes(pathname)) {
      tabLists[pathname].content = children;
      Object.assign(listObj, { [pathname]: tabLists[pathname] });
      // 刷新页面后,tab会重新打开,但是没有没有内容
    } else if (listObj[pathname] && !listObj[pathname].content) {
      listObj[pathname].content = children;
      // 路由不存在,一般是在地址栏中输入了不存在的url
    } else if (!tabLists[pathname]) {
      if (!listObj[pathname]) {
        Object.assign(listObj, {
          [errorRoute]: { key: errorRoute, tab: '无权限', content: errorPage },
        });
      }
      path = errorRoute;
    }

    if (!stateTabLists) {
      setStateTabLists(tabLists);
    }
    setActiveKey(path);
    // const hasData = Object.keys(listObj).length > 0;
    // hasData &&
    tabListRef.current = listObj;
    // setTabList(listObj);
  };

  const onChange = (key) => {
    setActiveKey(key);
    history.push(key);
  };

  const remove = (targetKey) => {
    let activeKeyTemp = null;
    const tabListObj = { ...tabListRef.current };
    const tabKeys = Object.keys(tabListRef.current);
    let lastIndex = tabKeys.length - 1;
    delete tabListObj[targetKey];
    lastIndex -= 1;
    if (activeKey === targetKey) {
      activeKeyTemp = tabKeys[lastIndex];
    } else {
      activeKeyTemp = activeKey;
    }
    tabListRef.current = tabListObj;
    // setTabList(tabListObj);
    setActiveKey(activeKeyTemp);
    setNeedRouterPush(true);
  };

  const onEdit = (targetKey, action) => {
    if (action === 'remove') {
      remove(targetKey);
    }
  };

  useEffect(() => {
    renderTabs(props);
  }, [props]);
  useEffect(() => {
    storage.session.set('AntTabs', Object.keys(listObj));
  }, [listObj]);
  useEffect(() => {
    storage.session.set('AntTabs', Object.keys(tabListRef.current));
    needRouterPush && history.push(activeKey);
    setNeedRouterPush(false);
  }, [tabListRef.current, activeKey, needRouterPush]);

  return (
    <Tabs
      className={styles.content_tab}
      activeKey={activeKey}
      onChange={onChange}
      tabBarStyle={{ background: '#fff' }}
      tabPosition="top"
      tabBarGutter={-1}
      hideAdd
      type="editable-card"
      onEdit={onEdit}
    >
      {Object.keys(tabListRef.current).map((item) => {
        const { tab, key, content } = tabListRef.current[item];
        return (
          <TabPane tab={tab} key={key} closable={Object.keys(tabListRef.current).length !== 1}>
            {content}
          </TabPane>
        );
      })}
    </Tabs>
  );
};

export default TabPages;
