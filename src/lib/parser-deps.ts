export interface IAssetConfig {
    name: string;
    path: string;
    deps?: string | string[]; // 依赖哪些项
    priority?: number;
}


export interface IDepsMap {
    [key: string]: IAssetConfig['deps'];
}

function buildDualStack(dep: string, depsMap: IDepsMap, mainStack: string[], secondStack: string[][]) {
    mainStack.push(dep);
    secondStack.push([].concat(depsMap[dep] || []));
} 

/**
 * 获取依赖路径最长的 “线路”
 * 其实就是一个获取全路径的算法，使用双栈法
 * https://zhuanlan.zhihu.com/p/84437102
 * 
 * @export
 * @param {string} dep - 当前入口依赖项
 * @param {IDepsMap} depsMap - 依赖项列表
 * @returns
 */
export function getMaxDepsChain(dep: string, depsMap: IDepsMap) {
    if (!dep) throw new Error('[getMaxDepsChain] dep 参数不能为空');
    
    // 所有路径保存
    const chains: string[][] = [];

    // 首次建栈
    const mainStack: string[] = [];
    const secondStack: string[][] = [];

    buildDualStack(dep, depsMap, mainStack, secondStack);

    while(mainStack.length) {
        // 获取辅栈栈顶，为邻接节点列表
        const curDeps = secondStack.pop();

        if (curDeps && curDeps.length) {
            // 获取邻接节点列表首个元素
            const nextName = curDeps.shift();
            secondStack.push(curDeps); // 将其压栈压回去
            // 将该元素压入主栈，剩下列表压入辅栈
            if (!!~mainStack.indexOf(nextName)) {
                throw new Error(`[getMaxDepsChain][loop] 存在循环依赖，请检查依赖关系; nextName: ${nextName}, mainStack: ${mainStack}`);
            }
            // 重新建栈，建立下一个关系
            buildDualStack(nextName, depsMap, mainStack, secondStack);
        } else {
            // 输出一条全路径
            // console.log('router:', [].concat(mainStack), '; second:', [].concat(secondStack));
            chains.push([].concat(mainStack));

            // 削栈
            mainStack.pop();
        }
    }

    // 返回其中最长的一条线路就行
    return chains.reduce((accumulator: string[], chain: string[]) => {
        return chain.length > accumulator.length ? chain : accumulator
    }, []);
}


/**
 * 将一维资源数组转换成二维优先级数组
 *
 * @export
 * @param {IAssetConfig[]} assetsConfig - 一维资源数组
 */
export function depsParser(assetArray: IAssetConfig[]) {
    if (!assetArray) throw new Error('[depsParser] 入参不能为空');

    // 首先进行一次遍历，初始化优先级都为 0;
    const depsMap: IDepsMap = {};
    assetArray.forEach((asset: IAssetConfig)=>{
        // 进行信息的挂载
        depsMap[asset.name] = asset.deps || [];
    });

    const priorityArray: (IAssetConfig[])[] = [];

    // 生成优先级队列
    assetArray.forEach((asset: IAssetConfig) => {
        const { name } = asset;

        const curPriority = getMaxDepsChain(name, depsMap).length - 1;

        // 更新优先级数据
        asset.priority = curPriority;

        // 更新优先级队列
        priorityArray[curPriority] = (priorityArray[curPriority] || []).concat(asset);
    });

    return priorityArray;
}
