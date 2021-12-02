import { createRouter, createWebHashHistory } from 'vue-router'

import LoginVue from '../components/Login.vue'

const routes = [
  {path: '', redirect: '/login'},
  {path: '/login', component: LoginVue},
  {path: '/home', component: home }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})