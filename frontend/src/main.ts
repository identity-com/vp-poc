import Vue from 'vue';
import { schemaLoader } from '@identity.com/credential-commons';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import config from './plugins/config';

import SchemaLoader from '@/schemas';

// eslint-disable-next-line no-unused-expressions
import('setimmediate');

Vue.config.productionTip = false;

Vue.use(config);
schemaLoader.addLoader(new SchemaLoader());

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
