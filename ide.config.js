module.exports = {
  name: 'aa-loader',
  className: 'aaLoader',
  libName: 'aaLoader',
  proxyLibs: [], // 要代理的联调的包, 支持字符串或者对象格式
  proxyLabPathPrefix: '..', // 需要代理的联调的包路径前缀
  externals: [] // 想要 externals 的列表，完整对象格式
};
