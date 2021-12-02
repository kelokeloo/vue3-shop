import { createApp } from 'vue'
import App from './App.vue'

// 导入路由配置
import router from './router/route.js'

// 导入全局样式
import './CSS/global.scss'

// 导入图标资源
import './assets/iconfont/iconfont.js'

// 导入element plus 样式
import 'element-plus/dist/index.css'

// 导入vuex 配置
import store from './Vuex/vuex.js'

const app = createApp(App)

app.use(router)
app.use(store)



app.mount('#app')

