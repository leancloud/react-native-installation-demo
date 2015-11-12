LeanCloud React Native Installation Demo
====
本 Demo 演示了如何在 React Native for iOS 中使用 LeanCloud 的推送服务。

<img src="https://cloud.githubusercontent.com/assets/175227/11111088/f1dacae0-893f-11e5-88f7-8e1d17b6dad5.png" width="360" />

----
### 源码分析

在开始之前，我们假设你已经了解 iOS 的推送运行机制，如果不了解，可以先阅读[《细说 iOS 消息推送》](https://blog.leancloud.cn/1163/) 以及 [《LeanCloud 消息推送开发指南》](https://leancloud.cn/docs/push_guide.html)。

#### 配置

首先，按照 [Linking Libraries - React Native docs](https://facebook.github.io/react-native/docs/linking-libraries-ios.html#content) 的说明，在你的 iOS 项目中引入 RCTPushNotification。

然后，按照 [PushNotificationIOS - React Native docs](https://facebook.github.io/react-native/docs/pushnotificationios.html#content) 的说明，将推送相关的事件代理给 js。

接下来，在你的 React 项目中安装依赖模块 avoscloud-sdk 与 [leancloud-installation](https://github.com/leancloud/javascript-sdk-installation-plugin)。
```
npm install avoscloud-sdk leancloud-installation --save
```
最后在 js 入口文件（index.ios.js）中引入所需要的模块并初始化：
```javascript
var PushNotificationIOS = require('react-native').PushNotificationIOS;
var AV = require('avoscloud-sdk');
AV.initialize('appId', 'appKey');
var LeancloudInstallation = require('leancloud-installation')(AV);
```

#### 获取 deviceToken，更新 \_Installation 表

为了保证 installation 得到及时的更新，我们需要在每次 app 启动时向 LeanCloud 进行注册。具体操作为：

第一步：在 app root component 的 `componentDidMount` 阶段，注册 `PushNotificationIOS` 的 `register` 事件回调（不要忘记在 `componentWillUnmount` 时移除）。然后调用 `PushNotificationIOS.requestPermissions` 以获取 `deviceToken`。
```javascript
componentDidMount: function() {
  // Subscribe to register event of PushNotificationIOS.
  PushNotificationIOS.addEventListener('register', this._onRegister);
  // Request permissions and deviceToken
  PushNotificationIOS.requestPermissions();
}
```
如果用户第一次打开 app，会出现 alert 询问是否允许推送，同意后 `register` 事件会被派发。此后用户再次打开 app 会直接派发 `register` 事件。

第二步：在 `register` 事件的回调中获取当前设备的 installation 实例，设置 `deviceToken`，然后保存。
```javascript
_onRegister: function(deviceToken) {
  LeancloudInstallation.getCurrent()
    .then(installation =>
      // Set new deviceToken and save.
      installation.save({
        deviceToken: deviceToken
      });
    );
}
```
`register` 事件的回调的第一个参数是 `deviceToken`。`LeancloudInstallation.getCurrent()` 得到的 `installation` 是 `AV.Object` 子类的实例，所以 [`AV.Object` 的方法](https://leancloud.cn/docs/api/javascript/symbols/AV.Object.html)也都可以调用，比如上面对 `installation` 的操作也可以写作：
```javascript
installaton.set('deviceToken', deviceToken);
return installaton.save();
```
除了 deviceToken，你也可以设置其他的字段，系统字段的含义参见[消息推送开发指南 - 基本概念](https://leancloud.cn/docs/push_guide.html#Installation)。

### 响应推送
响应收到的推送消息分为两种情况

#### App 正在运行
如果 app 正在运行，包括在后台运行，`PushNotificationIOS` 会派发 `notification` 事件，其参数及用法参见 [PushNotificationIOS 文档](https://facebook.github.io/react-native/docs/pushnotificationios.html)。

#### 点击推送消息启动 app
如果 app 是通过点击推送消息「冷启动」的，调用 `PushNotificationIOS.popInitialNotification()` 方法可以得到对应的 `notification`。然后就可以分析 `notification` 的信息跳转到不同的界面。同样，这个方法应该在 root component 的 `componentDidMount` 阶段调用。

### FAQ
#### Simulator 无法运行
是的，推送功能必须真机调试。
#### How about Android
由于 LeanCloud Android 推送功能是 Android SDK 来实现的，所以目前并没有类似 `PushNotificationIOS` 的 React Native 模块可用，建议直接使用 Android SDK，然后自己实现 SDK 与 js 之间的事件代理。
