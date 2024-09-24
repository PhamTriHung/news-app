import { createStore } from 'vuex/types/index.js';

export const store = createStore({
  state() {
    return {
      news: [],
    };
  },

  getters: {
    getNewById: (state) => (id) => {
      return state.news.find((newObj) => newObj.objectID === id);
    },
  },

  mutations: {
    saveNews(state, payload) {
      state.news = payload.news;
    },
  },
});
