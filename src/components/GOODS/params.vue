<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 提醒 -->
    <el-alert title="只允许三级分类设置相关参数" type="warning" :closable="false" style="margin-bottom: 1rem;"/>
    <!-- 级联选择 -->
    <el-cascader
      v-model="cateData.casSelected"
      :options="cateData.List"
      :props="cateData.casOptions"
      @change="addCathandleChange"
      style="margin-bottom: 1rem;"
    ></el-cascader>
    <!-- tab -->
    <el-tabs v-model="paramsAttrData.activeName" @tab-click="handleClick">
      <!-- 动态参数 -->
      <el-tab-pane label="动态参数" name="params">
        <el-button type="primary" :loading="!btnShow" @click="showAddDialog('many')">添加动态参数</el-button>
        <el-table :data="paramsData.params" style="width: 100%">
          <el-table-column type="expand">
            <template #default="{row}">
              {{row}}
              <el-tag v-for="(tag,index) in row.attr_vals" :key="index" closable type="warning" style="margin-right: 1rem;"
                @close="deleteTag(row, tag)"
              >
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column type="index"/>
          <el-table-column prop="attr_name" label="参数名称" />
          <el-table-column label="操作" >
            <template v-slot="{row}">
              <el-button type="warning" size="mini" @click="deleteParams(row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 静态属性 -->
      <el-tab-pane label="静态属性" name="attrs">
        <el-button type="primary" :loading="!btnShow" @click="showAddDialog('only')">添加静态参数</el-button>
        <el-table :data="paramsData.attrs" style="width: 100%">
          <el-table-column type="expand">
            <template #default="{row}">
              <p>{{ row.attr_vals}}</p>
            </template>
          </el-table-column>
          <el-table-column type="index"/>
          <el-table-column prop="attr_name" label="参数名称" />
          <el-table-column label="操作" >
            <template v-slot="{row}">
              <el-button type="warning" size="mini" @click="deleteParams(row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加属性or参数对话框 -->
    <el-dialog
      v-model="dialogData.dialogVisible"
      :title="(dialogData.FormData.attr_sel === 'many')? '添加动态参数':'添加静态属性'"
      width="50%"
      @closed="addDialogClose"
    >
      <el-form
        ref="addParmsDialogRef"
        :model="dialogData.FormData"
        :rules="rules"
        label-width="120px"
      >
      <!-- 分类ID -->
        <el-form-item label="分类ID">
          <el-input v-model="cateData.cateId" disabled></el-input>
        </el-form-item>
      <!-- 分类名 -->
        <el-form-item :label="(dialogData.FormData.attr_sel === 'many')? '参数名称':'属性名称'">
          <el-input v-model="dialogData.FormData.attr_name"></el-input>
        </el-form-item>
      <!-- 参数或属性选项 -->
        <el-form-item :label="(dialogData.FormData.attr_sel === 'many')? '填写参数':'填写属性'">
          <el-input v-model="dialogData.FormData.attr_vals" placeholder="以英文逗号分割"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogData.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="paramSubmit"
            >添加</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from "element-plus"
import { reactive, ref, watch, computed, warn } from "vue"
import store from "../../Vuex/vuex"
import rules from "../../utilityData/rules"

  export default {
    setup(){
      // 获取分类id
      const cateData= reactive({
        List:[],
        casSelected:[],
        casOptions:{
          value:'cat_id',
          label:'cat_name',
          children:'children'
        },
        // 分类ID
        cateId: 0
      })
      // cateData.cateId
      

      // 级联选择器区域
      //#region 

      const getCategoriesList = async ()=>{
        const {data: res} = await store.state.$http.get('categories')
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return 
        }
        cateData.List = res.data
        // console.log(cateData.List);
      }
      getCategoriesList()

      const addCathandleChange = ()=>{
        // console.log(cateData.casSelected);
        const len = cateData.casSelected.length
        if(len > 0){
          cateData.cateId = cateData.casSelected[len - 1]
          // console.log(cateData.cateId);
        }
        getParams()
      }
      //#endregion


      const paramsData = reactive({
        params:[],
        attrs:[]
      })

      // 添加参数或属性
      //#region 
      const dialogData = reactive({
        dialogVisible: false,
        FormData:{
          attr_name:'', // 参数名称
          attr_sel: '',
          // 参数或属性列表，提交到服务器需要转换成,分隔的字符串
          attr_vals: '',
        }
      })
      const addParmsDialogRef = ref(0)
      const showAddDialog = (type)=>{
        dialogData.dialogVisible = true
        console.log(type);
        dialogData.FormData.attr_sel = type
      }
      //#endregion


      // 根据分类id获取数据, 默认动态参数
      //#region 

      const getParamsByCateId = async (cateId)=>{
        // 动态参数
        let {data: res} = await store.state.$http.get(`categories/${cateId}/attributes`, {
          params:{
            sel:'many'
          }
        })
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return false
        }
        paramsData.params = res.data
        // 静态属性
        let {data: res2} = await store.state.$http.get(`categories/${cateId}/attributes`, {
          params:{
            sel:'only'
          }
        })
        if(res2.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res2.meta.msg
          })
          return false
        }
        
        paramsData.attrs = res2.data
        // 做数据处理， 将逗号分隔的参数变成数组
        paramsData.params.forEach((item)=>{
          item.attr_vals = item.attr_vals.split(',')
        })
        paramsData.attrs.forEach((item)=>{
          item.attr_vals = item.attr_vals.split(',')
        })
        
        console.log(paramsData);

      }
      const getParams = ()=>{
        getParamsByCateId(cateData.cateId)
      }

      // 动态参数和静态属性展示
      const paramsAttrData = reactive({
        activeName: 'params'
      })

      const handleClick = ()=>{
          
      }
      

      const addDialogClose = ()=>{
        dialogData.FormData = {
          attr_name:'', 
          attr_sel: '',
          attr_vals: ''
        }
      }      

      //#endregion

      // 提交参数
      const paramSubmit = async ()=>{
        addParmsDialogRef.value.validate(async (valid)=>{
          if(!valid) {
            ElMessage({
              type:'warning',
              message: '请按要求填写参数'
            })
            return
          }
          //发送请求
          const {data: res} = await store.state.$http.post(`categories/${cateData.cateId}/attributes`, dialogData.FormData)
          if(res.meta.status !== 201){
            ElMessage({
              type:'error',
              message: res.meta.msg
            })
            return false
          }
          ElMessage({
            type: 'success',
            message: res.meta.msg
          })
          getParamsByCateId(cateData.cateId)
        })
        dialogData.dialogVisible = false
      }


      // 删除参数或者属性标签
      const deleteTag = async (row, tagName)=>{
        // 查找row.attr_vals 中指定的标签进行删除
        let index = row.attr_vals.findIndex((item)=>
          item === tagName
        )
        console.log(row.attr_vals);
        row.attr_vals.splice(index,1)
        console.log(row.attr_vals);


        const submitParams = {
          // id:0 cateData.cateId
          // attrId:  row.attr_id
          attr_name:row.attr_name, // row.attr_name
          attr_sel: paramsAttrData.activeName === 'params'? 'many' :'only', // paramsAttrData.activeName
          attr_vals:row.attr_vals, // row.attr_vals
        }

        // console.log(cateData.cateId,row.attr_id, row.attr_name,
        // paramsAttrData.activeName,row.attr_vals);
        // 同步到服务器
        console.log(paramsAttrData.activeName);

        const {data: res} = await  store.state.$http.put(`categories/${cateData.cateId}/attributes/${row.attr_id}`,submitParams)
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return false
        }

      }

      // 删除参数或属性
      const deleteParams =async (attr_id)=>{
        console.log(cateData.cateId, attr_id)
        const {data:res} = await store.state.$http.delete(`categories/${cateData.cateId}/attributes/${attr_id}`)
        console.log(res);
        if(res.meta.status !== 200){
          ElMessage({
            type: 'error',
            message: res.meta.msg
          })
          return false
        }
        // 更新
        getParamsByCateId(cateData.cateId)
      }

      // watch(cateData, (nvalue)=>{
      //   if()
      //   console.log('watch cateData', nvalue);
      // })
      
      let btnShow = computed(()=>{
        if(cateData.casSelected.length > 0){
          return true
        }
        else{
          return false
        }
      })


      return {
        paramSubmit,
        dialogData,
        handleClick,
        paramsAttrData,
        cateData,
        addCathandleChange,
        getParams,
        paramsData,
        showAddDialog,
        addParmsDialogRef,
        rules,
        btnShow,
        addDialogClose,
        deleteTag,
        deleteParams
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>