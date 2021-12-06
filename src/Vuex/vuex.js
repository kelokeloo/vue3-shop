import {createStore} from 'vuex'
import axios from 'axios'


// 设置基准地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

//设置请求拦截器 每次访问都添加token
axios.interceptors.request.use((config)=>{
  let token = window.sessionStorage.getItem('token')
  if(token){
    config.headers.Authorization = token 
  }
  return config
})


// 将axios放入vuex中，减少每次的导入
const store = createStore({
  state(){
    return {
      $http: axios,
    }
  }
})


export default store