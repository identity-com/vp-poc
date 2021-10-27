import Vue from 'vue';
import { schemaLoader } from '@identity.com/credential-commons';
import { SchemaLoader as CivicSchemaLoader } from 'civic-schemas';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import config from './plugins/config';

console.log(CivicSchemaLoader);

// eslint-disable-next-line no-unused-expressions
import('setimmediate');

Vue.config.productionTip = false;

Vue.use(config);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');

schemaLoader.addLoader(new CivicSchemaLoader(undefined, null, 'http://dev-schemas.civic.com.s3-website-us-east-1.amazonaws.com/preprod'));
