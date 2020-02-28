import * as React from 'react';
import { render } from 'react-dom';
import { Button } from 'antd';
import { loadScriptsQueue, IScriptsLoadResult } from '../src/';
import { assetArray, BASEURL } from './deps';

let lastLoadResult: IScriptsLoadResult = {};

const App = () => {
  // 点击按钮之后才进行加载
  const onClickLoadScript = () => {
    lastLoadResult = {}; // 清空

    loadScriptsQueue(assetArray, {
      baseUrl: BASEURL,
      lastLoadResult
    }).then(result => {
      console.log('load result: ', result);
    });
  };
  return (
    <div>
      <Button onClick={onClickLoadScript}>点击加载脚本</Button>
    </div>
  );
};

render(<App />, document.getElementById('example') as HTMLElement);
