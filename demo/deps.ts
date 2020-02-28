export const BASEURL = '//g.alicdn.com/lf/lf-canvas-assets/0.1.3/externaljs/';

export const assetArray = [
    {
        name: 'Ette',
        path: 'ette.js'
    },
    {
        name: 'mobx',
        path: 'mobx.js'
    },
    {
        name: 'styled',
        path: 'styled-components.js'
    },
    {
        name: 'ideLibUtils',
        path: 'ide-lib-utils.js'
    },
    {
        name: 'ssTree',
        path: 'ss-tree.js'
    },
    {
        name: 'mobxStateTree',
        path: 'mobx-state-tree.js',
        deps: 'mobx'
    },
    {
        name: 'mobxReact',
        path: 'mobx-react-lite.js',
        deps: 'mobx'
    },
    {
        name: 'etteRouter',
        path: 'ette-router.js',
        deps: 'ette'
    },
    {
        name: 'etteProxy',
        path: 'ette-proxy.js',
        deps: 'ette'
    },
    {
        name: 'ideBaseComponent',
        path: 'ide-lib-base-component.js',
        deps: ['mobx', 'styled', 'etteProxy', 'etteRouter']
    },
    // 第二优先级
    {
        name: 'ideModelUtils',
        path: 'ide-model-utils.js',
        deps: ['ideBaseComponent']
    },
    {
        name: 'ideLibEngine',
        path: 'ide-lib-engine.js',
        deps: ['ideModelUtils', 'ideBaseComponent']
    }
]