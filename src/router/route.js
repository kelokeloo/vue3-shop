import { createRouter, createWebHashHistory } from 'vue-router'

import LoginVue from '../components/Login.vue'
import Home from '../components/HOME/Home.vue'

//users
import Users from '../components/USERS/Users.vue'
import Welcome from '../components/OTHER/Welcome.vue'

// rights
import RolesList from '../components/RIGHTS/RolesList.vue'
import RightsList from '../components/RIGHTS/RightsList.vue'

// goods
import Goods from '../components/GOODS/goods.vue'
import categories from '../components/GOODS/categories.vue'
import params from '../components/GOODS/params.vue'
import addGood from '../components/GOODS/addGood.vue'

// orderlist
import orderList from '../components/Orders/orderList.vue'
import dataShow from '../components/dataStatistics/dataShow.vue'

const routes = [
  {path: '', redirect: '/login'},
  {path: '/login', component: LoginVue},
  {
    path: '/home', 
    component: Home,
    children:[
      {path: '', component: Welcome},
      {path: 'users', component: Users},
      {path: 'roles', component: RolesList},
      {path: 'rights', component: RightsList },
      {path: 'goods', component: Goods},
      {path: 'categories', component: categories},
      {path: 'params', component: params},
      {path: 'addGood', component: addGood},
      {path: 'orders', component: orderList},
      {path: 'reports', component: dataShow}
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