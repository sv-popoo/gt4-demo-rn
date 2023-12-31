/*
 * @Description: 中间页
 * @Version: 1.0.0
 * @Date: 2022-05-25 17:16:26
 * @LastEditors: Yawen Yang
 * @LastEditTime: 2022-06-24 16:27:01
 */
import {View, StyleSheet, Platform, Dimensions} from 'react-native';
import React, {PureComponent} from 'react';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

export default class WebviewDemo extends PureComponent<any, any> {
  // webView: React.RefObject<any>;
  webref: any;
  status: any;
  constructor(args: any) {
    super(args);
    // this.webView = React.createRef();
  }

  // 监听事件---状态机是否发生改变
  onNavigationStateChange(navState: string) {
    console.log('onNavigationStateChange -->', navState);
  }

  onLoadStart() {}

  onLoadEnd() {}
  onMessage(event: WebViewMessageEvent) {
    console.log('onMessage ', event);
  }
  componentDidMount() {}
  componentDidUpdate(prevProps: any) {
    if (this.status === 'ready') {
      this.props.show &&
        this.webref.injectJavaScript('window.captchaObj.showCaptcha()');
    } else {
      const interval = setInterval(() => {
        if (this.status === 'ready' && this.props.show) {
          this.webref.injectJavaScript('window.captchaObj.showCaptcha()');
          clearInterval(interval);
        }
      }, 10);
    }
  }
  render() {
    let sources =
    (Platform.OS === 'android'
    ? 'file:///android_asset/': 'https://ops.btest.popoo.foundation/') +
    'demo.html?data=' + encodeURIComponent (
    '{"captchaId": "0a617ddc983efc42640258512cbf0167", "protocol":"https://"}',
      );
    //页面加载完成触发
    const webViewOnLoad = (syntheticEvent: {nativeEvent: any}) => {
      const {nativeEvent} = syntheticEvent;
      const curl = nativeEvent.url;
      //根据url地址判断刚才已经完成什么操作
      const jmurl = decodeURIComponent(curl);
    };
    //获取设备的宽度和高度
    var {height: deviceHeight, width: deviceWidth} = Dimensions.get('window');
   
    return (
      <View style={{width: deviceWidth, height: deviceHeight - 60}}>
        <WebView
          ref={r => (this.webref = r)}
          allowFileAccess={true}
          source={{uri: sources}}
          // source={{uri: sources}}
          onLoad={webViewOnLoad}
          javaScriptEnabled={true}
          originWhitelist={['*']}
          automaticallyAdjustContentInsets={false}
          onMessage={(e: {nativeEvent: {data?: any}}) => {
            // Alert.alert('Message received from JS:', e.nativeEvent.data);
            const type = JSON.parse(e.nativeEvent.data).type;
            const data = JSON.parse(e.nativeEvent.data).data;
            switch (type) {
              case 'ready':
                // Alert.alert(this.props.show)
                this.status = 'ready';
                // console.log(this.props.show,this.status)
                break;
              case 'fail':
                this.props.onFail(data);
                break;
              case 'error':
                this.props.onError(data);
                break;
              case 'result':
                this.props.onSuccess(data);
                break;
              case 'close':
                this.props.onClose(data);
                break;
            }
          }}
          mixedContentMode="compatibility"
          allowingReadAccessToURL="*"
          useWebKit={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14bE4b',
  },
});
