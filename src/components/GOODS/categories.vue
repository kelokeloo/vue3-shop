<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 添加分类 -->
    <el-button type="primary" style="margin-bottom: 1rem" @click="showAddCatDialog">添加分类</el-button>
    <!-- 分类列表 -->
    <el-table
      :data="categoriesList.List"
      style="width: 100%; margin-bottom: 20px"
      row-key="cat_id"
      :tree-props="categoriesList.TreeOption"
      border
    >
      <el-table-column type="index" width="50" />
      <el-table-column prop="cat_name" label="分类名称" sortable  />
      <el-table-column prop="cat_level" label="分类等级" sortable >
        <template v-slot="{row}">
          <el-tag :type="categoriesList.level[row.cat_level]">{{categoriesList.levelLabel[row.cat_level]}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cat_deleted" label="分类是否有效" sortable >
        <template v-slot="{row}">
          <el-tag :type="!row.cat_deleted ? 'success' : 'warning'">{{!row.cat_deleted ? '有效' : '无效'}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" sortable >
        <template v-slot="{row}">
          <el-button type="warning" round size='mini' @click="showEditCategory(row)">编辑分类</el-button>
          <el-button type="danger" round size='mini' @click="deleteCategory(row)">删除分类</el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 编辑分类对话框 -->
    <el-dialog
      v-model="editData.dialogVisible"
      title="编辑分类"
      width="50%"
      @closed="cleanForm"
    >
      <el-form
        ref="editFormRef"
        :model="editData.formData"
        :rules="rules"
        label-width="120px"
      >    
        <el-form-item label="当前分类名称">
          <el-input v-model="editData.formData.curName" disabled></el-input>
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="editData.formData.targetName" placeholder="修改后的分类名称"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editData.dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="EditSubmit"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addCatData.dialogVisible"
      title="编辑分类"
      width="50%"
      @closed="clearAddForm"
    >
      <el-form
        ref="addCatFormRef"
        :model="addCatData.formData"
        :rules="rules"
        label-width="120px"
      >    
        <el-form-item label="选择父分类">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="addCatData.casSelected"
            :options="addCatData.cateListTwo"
            :props="addCatData.casOptions"
            @change="addCathandleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="addCatData.formData.cat_name" placeholder="分类名称"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addCatData.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addSubmit"
            >添加</el-button
          >
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>import { ElMessage } from "element-plus"
import { reactive, ref , watch} from "vue"
import store from "../../Vuex/vuex"
import rules from '../../utilityData/rules.js'

  export default {
    setup(){
      // 获取分类列表数据
      //#region 
      const categoriesList = reactive({
        List:[],
        TreeOption: {
          children: 'children' 
        },
        level:['', 'success', 'warning'],
        levelLabel:['一级','二级', '三级']
      })
      const getCategoriesList = async ()=>{
        const {data: res} = await store.state.$http.get('categories')
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return 
        }
        categoriesList.List = res.data
        // console.log(categoriesList.List);
      }
      //#endregion
      getCategoriesList()

      // 编辑分类数据
      //#region 
      const editData = reactive({
        dialogVisible: false,
        catId : -1,
        formData:{
          curName:'',
          targetName:''
        },
        formRef:null
      })
      const editFormRef = ref(null)
      let RowProxy;

      const showEditCategory = (row)=>{
        editData.dialogVisible = true
        editData.formData.curName = row.cat_name
        editData.catId = row.cat_id
        // console.log(row);
        // 试图修改cat_name
        // row.cat_name = '修改'
        // 创建一个row.cat_name的代理
        RowProxy = new Proxy(row,{})
      }

      const EditSubmit = async ()=>{
        editFormRef.value.validate(async (valid)=>{
          if(!valid) {
            ElMessage({
              type:'error',
              message:'请按要求正确填写信息'
            })
          }
          else{
            const {data:res} = await store.state.$http.put(`categories/${editData.catId}`, {
              cat_name: editData.formData.targetName
            })  
            if(res.meta.status !== 200){
              ElMessage({
                type:'error',
                message:res.meta.msg
              })
            }
            else{
              ElMessage({
                type:'success',
                message:res.meta.msg
              })
            }
            // 刷新
            getCategoriesList()
          }
        })
        editData.dialogVisible = false
      }
      // 清除表单
      const cleanForm = ()=>{
        editData.formData.targetName = ''
      }

      //#endregion

      // 删除分类数据
      //#region 
      const deleteCategory = (row)=>{
        // console.log(row.cat_id);
        ElMessageBox.confirm(
          '将永久删除该分类. 继续?',
          'Warning',
          {
            confirmButtonText: '继续',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
          .then(async() => {
            const {data: res} = await store.state.$http.delete(`categories/${row.cat_id}`)
            if(res.meta.status !== 200){
              ElMessage({
                type: 'info',
                message: res.meta.msg
              })
              return false
            }
            ElMessage({
              type: 'success',
              message: 'Delete completed',
            })
          })
          .catch(() => {
            ElMessage({
              type: 'info',
              message: 'Delete canceled',
            })
          })
      }

      //#endregion
      
      // 添加分类
      //#region 
      const addCatData = reactive({
        dialogVisible: false,
        formData:{
          cat_pid: 0,
          cat_name:'',
          cat_level: 0
        },
        // 两层的分类列表
        cateListTwo:[],
        //级联选择器配置
        casOptions:{
          value:'cat_id',
          label:'cat_name',
          children:'children',
          checkStrictly: true
        },
        // selected
        casSelected:[]
      })
      let addCatFormRef = ref(null)

      const getCateListTwo = async ()=>{
        const {data:res} = await store.state.$http.get('categories', {
          type: '1'
        })
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return false
        }
        addCatData.cateListTwo = res.data
        console.log(addCatData.cateListTwo);
      }

      getCateListTwo()

      const showAddCatDialog = ()=>{
        addCatData.dialogVisible = true
      }

      
      const addCathandleChange = ()=>{
        console.log('change');
        console.log(addCatData.casSelected);
        if(addCatData.casSelected.length === 3){
          ElMessage({
            type:'warning',
            message: '不要选择三级分类'
          })
          addCatData.casSelected = []
          return false
        }
        if(addCatData.casSelected.length > 0){
          let len = addCatData.casSelected.length
          addCatData.formData.cat_pid = addCatData.casSelected[len-1]
          addCatData.formData.cat_level = len
        }
      }

      const addSubmit = async ()=>{
        console.log(addCatData.formData);
        const {data:res} = await store.state.$http.post('categories',addCatData.formData)
        if(res.meta.status !== 201){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return false
        }
        // 更新数据
        getCategoriesList()
        addCatData.dialogVisible = false
      }

      // 清除表单数据
      const clearAddForm = ()=>{
        addCatData.formData = {
          cat_pid:-1,
          cat_name:'',
          cat_level:-1
        }
        addCatData.casSelected = []
      }

      //#endregion

      watch([addCatData.casSelected],(newValue)=>{
        console.log(newValue);
      })

      return {
        categoriesList,
        showEditCategory,
        deleteCategory,
        editData,
        rules,
        EditSubmit,
        cleanForm,
        editFormRef,
        addCatData,
        showAddCatDialog,
        addCatFormRef,
        clearAddForm,
        addSubmit,
        addCathandleChange

      }
    }
  }
</script>

<style lang="scss" scoped>

</style>