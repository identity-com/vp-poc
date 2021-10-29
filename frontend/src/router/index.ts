import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Steps from '../views/Steps.vue';
import Sign from '../views/Sign.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Steps',
    component: Steps,
  },
  {
    path: '/sign',
    name: 'Sign',
    component: Sign,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
