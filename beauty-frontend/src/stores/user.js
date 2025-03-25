import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.username
  },

  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },

    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    clearUserInfo() {
      this.userInfo = null
      this.token = null
      localStorage.removeItem('token')
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user',
        storage: localStorage,
        paths: ['userInfo']
      }
    ]
  }
}) 