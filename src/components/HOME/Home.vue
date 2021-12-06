<template>
  <div class="homeContainer">
    <header class="header">
      <span>SHOP manage</span>
      <el-button type="info" size="mini" @click="logout">退出</el-button>
    </header>
    <main class="body">
      <aside class="border_radius">
         <el-menu
            router
          >
            <el-sub-menu
              v-for="(item,index) in menuList.value" :key="item.id"
              :index="index + ''"
            >
                <template #title><span>{{item.authName}}</span></template>
                <el-menu-item 
                  v-for="(subItem) in item.children" :key="subItem.id"
                  :index="'/home/' + subItem.path"
                >
                {{subItem.authName}}
                </el-menu-item>
            </el-sub-menu>
          </el-menu>
      </aside>
      <article class="border_radius">
        <router-view></router-view>
      </article>
    </main>
  </div>
</template>

<script>
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"
import store from "../../Vuex/vuex"
import { reactive } from "vue-demi"

  export default {
    setup(){
      // header 区域
      const $router = useRouter()
      const logout = ()=>{
        window.sessionStorage.removeItem('token')
        $router.push('/login')
      }

      // 左侧菜单权限
      let menuList = reactive({})

      // 访问数据
      const getAsideMenu = async ()=>{
        const {data: res} = await store.state.$http.get('menus')
        // console.log(res);
        if(res.meta.status !== 200){
          ElMessage({
            message: '获取左侧菜单失败',
            type:'error'
          })
          return false
        }
        menuList.value = res.data
        // console.log(menuList);
        // 改造成响应式
        // menuList = reactive(menuList)
      }
      getAsideMenu()
      

      return {
        logout,
        menuList,
        menuList
      }
    }
  }
</script>

<style lang="scss" scoped>
header.header{
  span{
    margin-left: 2rem;
    font-size: 2rem;
    font-weight: 700;
    color: white;
  }
  .el-button{
    margin-left: auto;
    margin-right: 2rem;
    height: 2rem;
  }
  display: flex;
  align-items: center;
  height: 4rem;
  background-color: #3498DB;
}

main.body{
  >aside{
    width: 200px;
    min-width: 150px;
    overflow: hidden;
  }
  >article{
    flex: 1;
    margin-left: 1rem;
    background-color: white;
  }
  margin-top: 1rem;
  display: flex;
  flex: 1;
}

main.body article{
  padding: 1rem;
}
.homeContainer{
  background-color: #ECF0F1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>