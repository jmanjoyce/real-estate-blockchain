import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';


interface AppState {
  authToken: string | null;
 
}


const store: StoreOptions<AppState> = {
  state: {
    authToken: null,
    
  },
  mutations: {
    setAuthToken(state, token: string) {
      state.authToken = token;
    },
    
  },
  actions: {
    saveToken({ commit }, token: string) {
      commit('setAuthToken', token);
      
    },
    
  },
  getters: {
    isAuthenticated: (state) => {
      return state.authToken !== null;
    },
    // Other getters for state access
  },
};

export default new Vuex.Store<AppState>(store);
