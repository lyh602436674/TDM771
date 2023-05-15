import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import secretLevel from './modules/secretLevel'
import uploadState from './modules/uploadState'
import user from './modules/user'
import permission from './modules/permission'
import enhance from './modules/enhance'
import online from './modules/online'
import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    secretLevel,
    uploadState,
    user,
    permission,
    enhance,
    online
  },
  state: {},
  mutations: {},
  actions: {},
  getters
})
