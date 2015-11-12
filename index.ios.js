/**
 * Sample React Native LeanCloud Notification App
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  PushNotificationIOS,
} = React;

var AV = require('avoscloud-sdk');
AV.initialize('NE1T3uRn8zjIWsmETEbsqpEu', '5K5HYy0wUmhryfKyQY2w1GtT');
var Installation = require('leancloud-installation')(AV);

var logs = [];
var startTime = Date.now();

var installationDemo = React.createClass({
  getInitialState: function() {
    return {logs};
  },
  componentDidMount: function() {
    this.log('Subscribe to register event of PushNotificationIOS.');
    PushNotificationIOS.addEventListener('register', this._onRegister);
    this.log('PushNotificationIOS.requestPermissions()');
    PushNotificationIOS.requestPermissions();
  },
  componentWillUnmount: function() {
    PushNotificationIOS.removeEventListener('register', this._onRegister);
  },
  log: function(text) {
    text = '[' + (Date.now() - startTime) + 'ms] ' + text;
    logs.push(text);
    this.setState({logs});
    console.log(text);
  },
  _onRegister: function(deviceToken) {
    this.log('_onRegistered called with deviceToken: ' + deviceToken);
    Installation.getCurrent()
      .then(installation => {
        this.log('Current installaton got: ' + JSON.stringify(installation.toJSON()));
        this.log('Set new deviceToken and save.');
        return installation.save({
          deviceToken: deviceToken
        });
      })
      .then(installation => {
        console.log();
        this.log('Installation updated: ' + JSON.stringify(installation.toJSON()));
        PushNotificationIOS.presentLocalNotification({
          alertBody: 'Installation updated.'
        });
      })
      .catch(error => this.log(error));
  },
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          LeanCloud Installation React Native Demo
        </Text>
        <Text style={styles.instructions}>
          {this.state.logs.join('\n')}
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 22,
    margin: 10,
  },
  instructions: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 24,
    margin: 10,
  },
});

AppRegistry.registerComponent('installationDemo', () => installationDemo);
