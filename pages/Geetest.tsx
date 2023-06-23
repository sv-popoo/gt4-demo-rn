import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Platform, View} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
const GEETEST_API_ID = '0a617ddc983efc42640258512cbf0167';

interface GeetestProps {
  show: boolean;
  onSuccess: () => void;
  onFail?: () => void;
  onError?: () => void;
  onClose: () => void;
}

const Geetest = ({show, onSuccess, onFail, onError, onClose}: GeetestProps) => {
  const webViewRef = useRef<WebView>(null);
  const [wvState, setWvState] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (wvState === 'ready') {
      console.log('run');
      show &&
        webViewRef.current?.injectJavaScript('window.captchaObj.showCaptcha()');
    } else {
      interval = setInterval(() => {
        if (wvState === 'ready' && show) {
          console.log('run');
          webViewRef.current?.injectJavaScript(
            'window.captchaObj.showCaptcha()',
          );
        }
      }, 10);
    }
    return () => {
      clearInterval(interval);
    };
  }, [show, wvState]);

  const webViewOnLoad = (syntheticEvent: {nativeEvent: any}) => {
    const {nativeEvent} = syntheticEvent;
    const curl = nativeEvent.url;
    //根据url地址判断刚才已经完成什么操作
    const jmurl = decodeURIComponent(curl);
    console.log(jmurl);
  };

  const {height: deviceHeight, width: deviceWidth} = Dimensions.get('window');
  const sources =
    (Platform.OS === 'android'
      ? 'file:///android_asset/'
      : 'http://localhost:8081/') +
    'Static.bundle/demo.html?data=' +
    encodeURIComponent(
      `{"captchaId":"${GEETEST_API_ID}","protocol":"https://"}`,
    );

  return (
    <View style={{width: deviceWidth, height: deviceHeight}}>
      <WebView
        ref={webViewRef}
        allowFileAccess={true}
        source={{uri: sources}}
        onLoad={webViewOnLoad}
        originWhitelist={['*']}
        automaticallyAdjustContentInsets={false}
        onMessage={(e: WebViewMessageEvent) => {
          const type = JSON.parse(e.nativeEvent.data).type;
          console.log(type, e.nativeEvent.url, e.nativeEvent.data);
          switch (type) {
            case 'ready':
              setWvState('ready');
              break;
            case 'fail':
              onFail && onFail();
              break;
            case 'error':
              onError && onError();
              break;
            case 'result':
              onSuccess();
              break;
            case 'close':
              onClose();
              break;
          }
        }}
        mixedContentMode="compatibility"
        allowingReadAccessToURL="*"
      />
    </View>
  );
};

export default Geetest;
