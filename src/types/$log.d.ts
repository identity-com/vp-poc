import Vue from 'vue';
import { Log } from 'vuejs-logger';

/**
 * The vuejs-logger package only defines $log for the vue instance, not for the constructor.
 * As a result, there is no way to call the logger on the Vue global. This fixes that.
 */
declare module 'vue/types/vue' {
  export interface VueConstructor<V extends Vue = Vue> {
    $log: Log
  }
}
