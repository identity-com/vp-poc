const loadConfig = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
  const config = require('../config/default');

  return Object.freeze(config.default);
};

export default {
  install(Vue: any) {
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$config = loadConfig();
  },
};
