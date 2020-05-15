# Ant Design Pro Tabs 

### 大家想要的,带有tab标签的ant design pro 又叕来啦!!!

- ###### 代码已经重写,使用hooks进行开发,精力有限,只出了js版本,需要ts的同学把类型改成any就好了(手动捂脸)

- ###### 基于最新版ant-design-pro 4.0 (仍然保留2.3.0包版本组件,TabPages/old.js就是了)

- ###### 原汁原味,只添加了tab,其他均无修改

- ###### 保留完整权限,输入错误地址仍然可以显示403

- ###### 模块化代码,最低引入一个文件即可完成tab的添加

- ###### 利用sessionStorage,刷新页面仍显可以显示之前未关闭的标签,重新打开浏览器只会显示路由所在的标签

- ###### 刷新页面会提示信息无法被保存(可在window.onbeforeunload中修改,删除此行就可以屏蔽该功能)

- ###### 样式方面参考了:https://github.com/kuhami/react-ant

- ###### 类库使用:good-storage

- ###### TODO:1. 隐藏标签实现类vue的keep-alive
  ######          ~~2. 输入错误路由逻辑有点乱,待优化~~
- ###### BUG:
  ######          1. 通过路由传参会找不到页面,从而报错

  ######          2.由于pro4.0没有menuData传进来,渲染全靠props.routes渲染,所以国际化可能会有点问题,导致路由路径必须和国际化一直,比如路径是a/b/c,那么国际化必须写成menu:{a:{b:{c:"xxxxx"}}},否则会tab可能会显示不正常

  ######          ~~3.输入错误的路由时逻辑还有点小问题,待修复~~

  ######          4.页签限制功能(maxTab),计算有时不准,待修复

  ######          ~~5.remberRefresh还有些问题,待修复~~

  ######          如有其他问题请反馈,谢谢

- ####  注意:
  ######          由于框架原因,所有路由都是先走/然后跳转,所以每次tab也都会有一个/,显示为menu.,目前的方法是把这个标签display:none了
  

pro 4.0 使用方法: 

1. 复制src/components/TabPages文件夹到自己的项目当中
2. src/layouts/BasicLayout.js中引入该组件
3.  

  ```html
    <Authorized authority={authorized.authority} noMatch={noMatch}>
      <TabPages {...props} maxTab="5" preventReload remberRefresh animated homePage="/dashboard/analysis" errorPage="/exception/404" /> 
    </Authorized>
      // 参数:
      // 1. maxTab="5"    标签开多了可能导致浏览器崩溃,设置一个最大数量,超出会提示
      // 2. remberRefresh 刷新页面也能记住之前打开的标签
      // 3. preventReload 刷新页面会提示
      // 4. homePage      主页url
      // 5. errorPage     错误页url
      // 6. animated      是否使用动画切换 Tabs
  ```

4.pro 2.0版本

  ```html
   <Content>
     {children} //注释此行,改为tab组件
     <TabPages {...this.props} homePageKey='/dashboard/home' errorPage={<NoAuth />} />
  </Content>				// homePageKey就是项目首页的url地址

  ```

5. 多标签的信息是存储在sessionStorage的AntTabs中,建议退出登录时清理一下,避免造成bug
6. 有问题欢迎多交流,github不常在线,着急的话请发邮件或者加我QQ(同邮箱)

<img src="https://github.com/bailihuiyue/ant-design-pro-tabs/raw/master/money.png" width="200px"> 
<div>一块两块不嫌少,一百两百不嫌多^_^