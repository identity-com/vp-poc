declare module 'civic-sip-api';
declare module '@digitalbazaar/vc';
declare module 'uuid';

declare module 'vue-jslogger' {
  module 'vue/types/vue' {
    interface VueConstructor {
      $log: {
        debug(...args: any[]): void;
        info(...args: any[]): void;
        warn(...args: any[]): void;
        error(...args: any[]): void;
        fatal(...args: any[]): void;
      };
    }
  }
}
