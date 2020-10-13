import Vue from 'vue';
import App from './App';
import { i18n } from '../popup/utils/i18nHelper';

global.browser = require('webextension-polyfill');

export default new Vue({
  el: '#app',
  i18n,
  render: h => h(App),
});
