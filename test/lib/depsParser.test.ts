import { depsParser, getMaxDepsChain, IDepsMap, IAssetConfig} from '../../src';
import Chance from 'chance';

const chance = new Chance();


describe('[getMaxDepsChain] 获取依赖 chain', () => {

  test('不互相依赖的情况', () => {
    const depsMap = {
    };

    const word = chance.word();
    expect(getMaxDepsChain(word, depsMap)).toEqual([word]);
  });

  test('简单相依赖的情况', () => {
    const depsMap: IDepsMap = {
      A: 'B', 
      C: 'B',
      D: []
    };

    expect(getMaxDepsChain('A', depsMap)).toEqual(['A', 'B']);
    expect(getMaxDepsChain('B', depsMap)).toEqual(['B']);
    expect(getMaxDepsChain('C', depsMap)).toEqual(['C', 'B']);
    expect(getMaxDepsChain('D', depsMap)).toEqual(['D']);
  });

  test('互相依赖，单链情况', () => {
    const depsMap = {
      'A': ['C', 'D'],
      'C': ['B', 'E'],
      'D': ['C'],
      'E': ['B']
    };

    const maxDepsChain = getMaxDepsChain('A', depsMap);
    expect(maxDepsChain).toEqual(['A', 'D', 'C', 'E', 'B']);

    expect(getMaxDepsChain('B', depsMap)).toEqual(['B']);

    expect(getMaxDepsChain('C', depsMap)).toEqual(['C', 'E', 'B']);

    expect(getMaxDepsChain('D', depsMap)).toEqual(['D', 'C', 'E', 'B']);

    expect(getMaxDepsChain('E', depsMap)).toEqual(['E', 'B']);

  });

});


const genAssetConfig = (name: string, deps?: IAssetConfig['deps'] ) =>{
  return {
    name,
    deps,
    path: chance.word(),
  }
}

describe('[depsParser] 将一维数组解析成二维优先数组', ()=>{

  test('不互相依赖的情况，返回一维数组', ()=>{
    const assetArray = [
      genAssetConfig('A'),
      genAssetConfig('B'),
      genAssetConfig('C')
    ];
    expect(depsParser(assetArray)).toEqual([assetArray]);
  });

  test('最多两层依赖的情况', ()=>{
    const assetA = genAssetConfig('A', ['B']);
    const assetB = genAssetConfig('B');
    const assetC = genAssetConfig('C');
    const assetD = genAssetConfig('D', 'B');
    const assetArray = [
      assetA,
      assetB,
      assetC,
      assetD,
    ];
    expect(depsParser(assetArray)).toEqual([
      [assetB, assetC], 
      [assetA, assetD]
    ]);
  });

  test('互相依赖，单链情况', () => {
    const assetA = genAssetConfig('A', ['C', 'D']);
    const assetB = genAssetConfig('B');
    const assetC = genAssetConfig('C', ['B', 'E']);
    const assetD = genAssetConfig('D', 'C');
    const assetE = genAssetConfig('E', ['B']);

    // 进行随机打乱
    const assetArray = chance.pickset([
      assetA,
      assetB,
      assetC,
      assetD,
      assetE,
    ], 5);

    expect(depsParser(assetArray)).toEqual([
      [assetB],
      [assetE],
      [assetC],
      [assetD],
      [assetA]
    ]);
  });

  test('互相依赖，较为复杂的情况', () => {
    const assetA = genAssetConfig('A', ['C', 'D']);
    const assetB = genAssetConfig('B');
    const assetC = genAssetConfig('C', ['B', 'E']);
    const assetD = genAssetConfig('D', ['B', 'E']);
    const assetE = genAssetConfig('E');

    const assetArray = [
      assetA,
      assetB,
      assetC,
      assetD,
      assetE,
    ];

    expect(depsParser(assetArray)).toEqual([
      [assetB, assetE],
      [assetC, assetD],
      [assetA]
    ]);
  });


});
