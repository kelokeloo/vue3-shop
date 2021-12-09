<template>
  <div>
    <!-- 级联选择器组件 -->
    <!-- 返回一个分类数组 -->
    <el-cascader
      v-model="CateData.selected"
      :options="CateData.cateList"
      :props="CateData.props"
      @change="handleChange"
    ></el-cascader>
  </div>
</template>

<script>
import {reactive} from 'vue'
import axios from 'axios';
import { ElMessage } from 'element-plus';
  export default {
    props:['Selected'],
    emits:['update:Selected'],
    setup(props, context){
      let i = 1

      const CateData = reactive({
        cateList : [],
        selected:[],
        props:{
          expandTrigger: 'hover',
          value:'cat_id',
          label:'cat_name',
          children: 'children'
        }
      })

      const getCateList = async ()=>{
        const {data: res} = await axios.get('categories')
        
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return false
        }
        CateData.cateList = res.data
      }

      getCateList()

      const handleChange = ()=>{
        // 发送数据到父组件
        context.emit('update:Selected', CateData.selected)
      }

      return {
        handleChange,
        CateData
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>