import Vue from 'vue';

const loadConfig = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
  const config = require('../config/default');

  return Object.freeze(config.default);
};

export default {
  install(vue: typeof Vue): void {
    // eslint-disable-next-line no-param-reassign
    vue.prototype.$config = loadConfig();
  },
};
