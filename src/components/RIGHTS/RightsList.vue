<template>
  <div>
    
  </div>
</template>

<script>
import store from "../../Vuex/vuex"

  export default {
    setup(){
      // 获取角色列表
      const rolesListData = null
      console.log('do');
      const getRolesList = async ()=>{
        const {data: res} = await store.state.$http.get('roles')
        console.log(res);
      }
      getRolesList()

      return {
        rolesListData
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>