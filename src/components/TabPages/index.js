import React, { useState, useEffect } from 'react';
import { history, useIntl } from 'umi';
import { Tabs, message } from 'antd';
import storage from 'good-storage';
import _ from 'lodash';
import styles from './page.less';

const { TabPane } = Tabs;

// const errorTabKey = 'errorPage';

const TabPages = (props) => {
  const [tabList, setTabList] = useState({});
  const [activeKey, setActiveKey] = useState('');
  // const [needGoback, setNeedGoback] = useState(false);
  const [allRoutes, setAllRoutes] = useState(false);
  const intl = useIntl();
  //   判断一个数组或者object是否为空
  const hasVal = (val) => {
    if (!val) {
      return false;
    }
    return Array.isArray(val) ? val.length !== 0 : Object.keys(val).length !== 0;
  };

  const transforPathToTxt = (path, node) => {
    if (node?.children?.length || node?.redirect) {
      return path;
    }
    if (path) {
      const txt = `menu${path.replace(/\//g, '.')}`;
      return intl.formatMessage({ id: txt });
    }
  };

  const getAllrouters = (data) => {
    const treeData = data;
    const treeList = [];
    const getTreeList = (tree) => {
      tree.forEach((node) => {
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

  const setStates = (currentTabPages, pathname, session) => {
    // 塞进所有标签到state
    currentTabPages && setTabList(currentTabPages);
    // 设置tab激活页面为当前路由
    pathname && setActiveKey(pathname);
    // 将已打开tab存到session中,防止页面刷新
    session && storage.session.set('AntTabs', Object.keys(currentTabPages));
  };

  const renderTabs = (unClosedTabs) => {
    const {
      location: { pathname },
      route: { routes },
      children,
      maxTab,
      errorPage,
    } = props;

    let currentTabPages = {};
    // 输入错误路由
    const tempRoutes = allRoutes || Object.keys(getAllrouters(routes));
    if (!tempRoutes.includes(pathname)) {
      message.error(`错误: ${pathname}不存在!`);
      Object.assign(currentTabPages, {
        [pathname]: {
          key: pathname,
          tab: '错误',
          content: errorPage,
        },
      });
      setStates(currentTabPages, pathname);
    }
    // 有unClosedTabs说明是页面初始化
    if (unClosedTabs) {
      // 先判断local存的数据是否是异常
      // 应对异常情况,比如local里存了/a/b,路由是/z/x
      if (!unClosedTabs.includes(pathname)) {
        storage.session.set('AntTabs', [pathname]);
        Object.assign(currentTabPages, {
          [pathname]: {
            key: pathname,
            tab: transforPathToTxt(pathname),
            content: children,
          },
        });
        setStates(currentTabPages, pathname, true);
      } else {
        // 把标签放入一个对象,当前的path塞进页面内容
        unClosedTabs.forEach((key) => {
          Object.assign(currentTabPages, {
            [key]: {
              key,
              tab: transforPathToTxt(key),
              content: pathname === key ? children : null,
            },
          });
        });
        setStates(currentTabPages, pathname, true);
      }
    } else if (hasVal(tabList)) {
      // 新增,切换tab的情况
      // 先将原tab复制一遍,以防额外的影响
      currentTabPages = _.cloneDeep(tabList);
      const limit = Number(maxTab);
      // 新增标签的情况限制一下标签数量    // 性能限制开多了会崩溃,可以限制个数
      if (!currentTabPages[pathname] && limit && Object.keys(tabList).length >= limit) {
        message.error(`最大打开${props.maxTab}个标签页,请关闭一些再打开新标签`);
        history.goBack();
        return false;
      }
      if (!currentTabPages[pathname]?.content) {
        // 如果么有content或者标签不存在,再添加
        currentTabPages[pathname] = {
          key: pathname,
          tab: transforPathToTxt(pathname),
          content: children,
        };
        setStates(currentTabPages, pathname, currentTabPages);
      }
    }
  };

  const needRouterPush = (key) => {
    const openedTabs = Object.keys(tabList);
    if (openedTabs.includes(key) && tabList[key]?.content) {
      return false;
    }
    return true;
  };

  const onChange = (key) => {
    setActiveKey(key);
    history.push(key);
    // needRouterPush(key) && history.push(key);
  };

  const remove = (targetKey) => {
    let activeKeyTemp = null;
    const tabListObj = { ...tabList };
    const tabKeys = Object.keys(tabList);
    let lastIndex = tabKeys.length - 1;
    delete tabListObj[targetKey];
    lastIndex -= 1;
    if (activeKey === targetKey) {
      activeKeyTemp = tabKeys[lastIndex];
    } else {
      activeKeyTemp = activeKey;
    }
    setTabList(tabListObj);
    setActiveKey(activeKeyTemp);

    // 切换tab同时也变url(关闭当前页面需要跳转到其他路由)
    if (activeKey === targetKey) {
      history.push(activeKeyTemp);
    }
  };

  const onEdit = (targetKey, action) => {
    if (action === 'remove') {
      remove(targetKey);
    }
  };

  useEffect(() => {
    const {
      location: { pathname },
      route: { routes },
    } = props;

    // 页面初始化获取所有路由列表,备用
    setAllRoutes(Object.keys(getAllrouters(routes)));

    // 页面初始化获取上次未关闭标签,如果没有,获取首页
    let unClosedTabs = storage.session.get('AntTabs');
    unClosedTabs = hasVal(unClosedTabs) ? unClosedTabs : [pathname];
    renderTabs(unClosedTabs);
    // 刷新页面提示
    // window.onbeforeunload = () => '';
  }, []);
  useEffect(() => {
    renderTabs();
  }, [props.location]);
  // useEffect(() => {
  //   if (needGoback) {
  //     message.error(`最大打开${props.maxTab}个标签页,请关闭一些再打开新标签`);
  //     history.goBack();
  //     setNeedGoback(false);
  //   }
  // }, [needGoback]);

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
      {Object.keys(tabList).map((item, i) => {
        const { tab, key, content } = tabList[item];
        const tabs = Object.keys(tabList);
        const disableClose = tabs.includes('/') && tabs.length === 2 && i === 1;
        return (
          <TabPane tab={tab} key={key} closable={!disableClose}>
            {content}
          </TabPane>
        );
      })}
    </Tabs>
  );
};

export default TabPages;
