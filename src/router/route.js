import { createRouter, createWebHashHistory } from 'vue-router'

import LoginVue from '../components/Login.vue'
import Home from '../components/HOME/Home.vue'



const routes = [
  {path: '', redirect: '/login'},
  {path: '/login', component: LoginVue},
  {
    path: '/home', 
    component: Home,
    children:[
      {path: '', component: ()=>import('../components/OTHER/Welcome.vue')},
      {path: 'users', component: ()=>import('../components/USERS/Users.vue')},
      {path: 'roles', component: ()=>import('../components/RIGHTS/RolesList.vue')},
      {path: 'rights', component: ()=>import('../components/RIGHTS/RightsList.vue')},
      {path: 'goods', component: ()=>import('../components/GOODS/goods.vue')},
      {path: 'categories', component: ()=>import('../components/GOODS/categories.vue')},
      {path: 'params', component: ()=>import('../components/GOODS/params.vue')},
      {path: 'addGood', component: ()=>import('../components/GOODS/addGood.vue')},
      {path: 'orders', component: ()=>import('../components/Orders/orderList.vue')},
      {path: 'reports', component: ()=>import('../components/dataStatistics/dataShow.vue')}
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 设置路由导航守卫

router.beforeEach((to, from, next)=>{
  if(to.path === '/login') 
    return next()
  const token = window.sessionStorage.getItem('token')
  if(!token){
    return next('/login')
  }
  next()
})

export default router