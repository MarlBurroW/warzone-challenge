import { createRouter, createWebHistory } from 'vue-router'
import Data from './Data.vue'
import Dashboard from './Dashboard.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/data',
      name: 'data',
      component: Data,
    },
  ],
})
