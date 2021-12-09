<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/home/goods'}">商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 返回 -->
    <el-button type="info" round @click="back" size="mini" style="margin-bottom:2rem;">返回</el-button>

    <!-- 添加商品表单 -->
    <el-form
      ref="addGoodFormRef"
      :model="FormData"
      :rules="rules"
      label-width="120px"
      class="demo-ruleForm"
    >
      <el-form-item label="商品名称" prop="goods_name">
        <el-input v-model="FormData.goods_name"></el-input>
      </el-form-item>
      <el-form-item label="分类列表">
        <CategoryCascaderVue v-model:Selected="cascaderData.Selected"></CategoryCascaderVue>
        <!-- <el-input v-model="FormData.goods_name"></el-input> -->
        {{cascaderData.Selected}}
      </el-form-item>

      <el-form-item 
        v-for="(item,index) in info"  :key='index'
        :label="item.label" :prop="item.prop">
        <el-input v-model="FormData[item.prop]"></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" style="float:right" @click="addGood">添加商品</el-button>
  </div>
</template>

<script>
import router from "../../router/route"
import { reactive,ref, watch } from "vue"
import rules from "../../utilityData/rules"
import CategoryCascaderVue from "../Utility/CategoryCascader.vue"
import store from "../../Vuex/vuex"
import { ElMessage } from 'element-plus'
  export default {
    setup(){
      const back = ()=>{
        router.back()
      }

      const FormData = reactive({
        goods_name:'',
        goods_cat: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce:'',
      })
      // cascaderData
      const cascaderData = reactive({
        Selected:[]
      })

      const addGoodFormRef = ref(null)

      // 添加商品
      const info = [
        {label:'价格', prop:'goods_price'},
        {label:'数量', prop:'goods_number'},
        {label:'重量', prop:'goods_weight'},
        {label:'介绍', prop:'goods_introduce'}
      ]

      // 添加商品
      const addGood = ()=>{
        // 验证
        addGoodFormRef.value.validate( async(valid)=>{
          if(!valid){
            ElMessage({
              type:'error',
              message: '请正确填写'
            })
            return false
          }

          // console.log(FormData);
          // 分类设置
          FormData.goods_cat = cascaderData.Selected.join(',')
          // 提交
          const {data: res} = await store.state.$http.post('goods', FormData)
          console.log(res);
          let type = 'success'
          if(res.meta.status !== 201){
            type = 'error'
          }
          ElMessage({
            type,
            message: res.meta.msg
          })
          
        })
      }
      

      return {
        cascaderData,
        addGoodFormRef,
        rules,
        back,
        FormData,
        info,
        addGood
      }
    },
    components:{
      CategoryCascaderVue
    }
  }
</script>

<style lang="scss" scoped>

</style>