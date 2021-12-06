<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- table展示区域 -->
    <el-table :data="tableData.data" border style="width: 100%">
      <el-table-column type="index" label="#"/>
      <el-table-column prop="authName" label="权限名称" />
      <el-table-column prop="path" label="权限路径"  />
      <el-table-column prop="level" label="权限等级" >
        <template v-slot="{row}">
          <el-tag v-if="row.level === '0'">等级一</el-tag>
          <el-tag v-else-if="row.level === '1'" type="success">等级二</el-tag>
          <el-tag v-else type="warning">等级三</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import {ref, reactive} from 'vue'
import store from '../../Vuex/vuex'
  export default {
    setup(){
      // table 数据展示
      //#region 
        // 数据存储

      const tableData = reactive({
        data: null
      })
      // 获取数据
      const getRightList = async (type = 'list')=>{
        const {data:res} = await store.state.$http.get(`rights/${type}`)
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return false
        }
        tableData.data = res.data
        
        // console.log(res);
      }
      getRightList()

      //#endregion,
      return {
        tableData
      }
    }
    
  }
</script>

<style lang="scss" scoped>

</style>