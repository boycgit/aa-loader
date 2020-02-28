import { IAssetConfig, depsParser } from "./parser-deps";


// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file

/**
 * 动态加载 script 
 *
 * @export
 * @param {string} url - js url 地址
 * @param {()=>void} callback - 加载完成后执行的回调函数
 */
export function loadScript(url: string) {
    return new Promise(function (resolve, reject) {
        // Adding the script tag to the head as suggested before
        var head = document.head;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        // @ts-ignore
        script.onreadystatechange = resolve;
        script.onload = resolve;
        script.onerror = reject;

        // Fire the loading
        head.appendChild(script);
    })
}

export interface IScriptsLoadResult {
    [key: string]: boolean;
}

export interface ILoaderConfig {

    /**
     * 请求的统一地址前缀
     *
     * @type {string}
     * @memberof ILoaderConfig
     */
    baseUrl?: string;

    /**
     * 请求结果对象，普通的 key-value
     *
     * @type {IScriptsLoadResult}
     * @memberof ILoaderConfig
     */
    lastLoadResult?: IScriptsLoadResult;
}



/**
 * 根据配置批量 load scripts
 *
 * @param {IAssetConfig[]} scripts - scripts 数据源
 * @param {ILoaderConfig} [config={}] - loader 相关配置项
 */
export const loadScripts = async (
    scripts: IAssetConfig[],
    config: ILoaderConfig = {}
) => {
    const { baseUrl = '', lastLoadResult } = config;
    return await Promise.all(
        scripts.map(async (script: IAssetConfig) => {
            const { name, path, deps } = script;

            const successResult = { [name]: true };
            const errorResult = { [name]: false };

            // 如果页面中已存在该对象，则不需要请求了
            if ((<any>window)[name]) {
                return successResult;
            } else {
                // 在根据依赖项决定是否请求
                let shouldLoad = true;
                if (!!deps && !!lastLoadResult) {
                    [].concat(deps).forEach((deps: string) => {
                        // 如果不是明确为 false 的话，就可以请求
                        if (lastLoadResult[deps] !== false) {
                            shouldLoad = true;
                        }
                    });
                }

                if (shouldLoad) {
                    return await loadScript(baseUrl + path)
                        .then(() => {
                            return successResult;
                        })
                        .catch(() => {
                            return errorResult;
                        });
                } else {
                    return errorResult;
                }
            }
        })
    );
};



/**
 * 按照优先级进行 scripts 加载，返回迭代器（iterator）
 *
 * @param {IAssetConfig[]} assetArray - 资源配置列表
 * @param {ILoaderConfig} [config={}] - 加载配置项
 */
export const dynamicLoadScripts = (assetArray: IAssetConfig[], config: ILoaderConfig = {}) => () => {

    const array = [].concat(depsParser(assetArray));
    return {
        next: () => {
            if (array.length) {
                const currentScripts = array.shift();
                return loadScripts(currentScripts, config).then((results: IScriptsLoadResult[]) => {
                    return {
                        value: results,
                        done: false
                    };
                });
            } else {
                return Promise.resolve({
                    done: true
                });
            }
        }
    };
};

/**
 * 根据配置项创建动态加载迭代器（iterator）
 *
 * @param {IAssetConfig[][]} assetArray - 资源配置列表
 * @param {ILoaderConfig} [config={}] - 加载配置项
 */
export const createScriptsLoadIterator = (assetArray: IAssetConfig[], config: ILoaderConfig = {}) => {
    return {
        [Symbol.asyncIterator]: dynamicLoadScripts(assetArray, config)
    };
};


/**
 * 根据配置项动态加载 scripts
 *
 * @param {IAssetConfig[]} assetArray - 资源配置列表
 * @param {ILoaderConfig} [config={}] - 加载配置项
 */
export const loadScriptsQueue = async (assetArray: IAssetConfig[], config: ILoaderConfig = {}) => {
    // @ts-ignore
    for await (const item of createScriptsLoadIterator(assetArray, config)) {
        config.lastLoadResult = config.lastLoadResult || {};
        console.log('current: ', item);
        item.forEach((curResult: IScriptsLoadResult) => {
            config.lastLoadResult = {
                ...config.lastLoadResult,
                ...curResult
            };
        });
    }
    // 返回加载集合
    return config.lastLoadResult;
}
