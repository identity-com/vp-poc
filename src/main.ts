import Vue from 'vue';
import VueLogger from 'vuejs-logger';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import config from './plugins/config';

Vue.config.productionTip = false;
const isProduction = process.env.NODE_ENV === 'production';

const options = {
  isEnabled: true,
  logLevel: isProduction ? 'error' : 'debug',
  stringifyArguments: false,
  showLogLevel: false,
  showMethodName: false,
  separator: '|',
  showConsoleColors: true,
};

Vue.use(VueLogger as any, options);
Vue.use(config);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
