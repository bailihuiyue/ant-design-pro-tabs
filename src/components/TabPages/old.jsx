import React, { PureComponent } from 'react';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { Tabs } from 'antd';
import storage from 'good-storage';
import styles from './page.less';

const { TabPane } = Tabs;
const errorRoute = "/error";

class TabPages extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            tabList: {},
            activeKey: "",
            stateTabLists: null,
        };
    }

    componentWillMount() {
        const {
            location: { pathname },
            homePageKey
        } = this.props;
        const unClosedTabs = storage.session.get('AntTabs') || [homePageKey];
        const listObj = {};
        let txt = '';
        let words = '';
        unClosedTabs.forEach(key => {
            if (words.indexOf("menu.") === -1) {
                txt = `menu${key.replace(/\//g, '.')}`;
                words = formatMessage({ id: txt });
                Object.assign(listObj, { [key]: { closable: key !== homePageKey, key, tab: words, content: '' } });
            }
        });
        this.setState({
            tabList: listObj,
            activeKey: pathname === "/" ? homePageKey : pathname,
        });

        if (pathname === "/") {
            router.replace(homePageKey);
        }

        window.onbeforeunload = () => "";
    }

    componentWillReceiveProps(nextProps) {
        this.renderTabs(nextProps);
    }

    onChange = key => {
        this.setState({ activeKey: key });
        router.push(key);
    };

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    };

    remove = targetKey => {
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
            }
        );
    };

    updateTreeList = data => {
        const treeData = data;
        const treeList = [];
        const getTreeList = tree => {
            tree.forEach(node => {
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

    renderTabs = props => {
        const {
            children,
            location: { pathname },
            menuData,
            errorPage,
            route: { routes },
        } = props;
        const { tabList, stateTabLists } = this.state;
        const tabLists = stateTabLists || this.updateTreeList(menuData || routes);
        const listObj = { ...tabList };
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
                Object.assign(listObj, { [errorRoute]: { closable: true, key: errorRoute, tab: "无权限", content: errorPage } });
            }
            path = errorRoute;
        }

        if (!stateTabLists) {
            this.setState({ stateTabLists: tabLists });
        }
        debugger
        this.setState(
            {
                activeKey: path,
                tabList: listObj,
            },
            () => {
                storage.session.set('AntTabs', Object.keys(listObj));
            }
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
                tabBarGutter={-1}
                hideAdd
                type="editable-card"
                onEdit={this.onEdit}
            >
                {Object.keys(tabList).map(item => {
                    const { tab, key, closable, content } = tabList[item];
                    return (
                        <TabPane tab={tab} key={key} closable={closable}>
                            {content}
                        </TabPane>
                    );
                })}
            </Tabs>
        );
    }
}

export default TabPages;
