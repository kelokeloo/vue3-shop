<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 添加角色 -->
    <el-button type="primary" style="margin-bottom:1rem;" @click="addRolesDialogShow">添加角色</el-button>
    <!-- 表格 -->
    <el-table :data="rolesListData.data" style="width: 100%" border>
      <!-- 扩展内容 -->
      <el-table-column type="expand">
        <template #default="scope">
          <el-table :data="scope.row.children" style="width: 100%" :show-header="false" :border="false">
            <!-- 第一列 -->
            <el-table-column width="200px">
              <template v-slot="{row}">
                <el-tag closable type="success">
                  {{ row.authName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column>
              <template v-slot="{row}">
                <el-table :data="row.children" style="width: 100%" :show-header="false" :border="false">
                  <!-- 第二列 -->
                  <el-table-column width="300px">
                    <template v-slot="{row}">
                      <el-tag closable>
                        {{ row.authName }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column>
                    <template v-slot="{row}">
                      <!-- 第三列 -->
                      <el-tag v-for="tag in row.children" :key="tag.id" closable type="warning" style="margin: 0.2rem"
                        @close="handleTagClose(tag.id, scope.row.id, row.children)"
                      >
                        {{ tag.authName }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column type="index" label="#" />
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="{row}">
          <el-button size="mini" type="primary" @click="showEditDialogRoles(row)">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-bianji"></use>
            </svg>
            <span>编辑</span> 
          </el-button>
          <el-button size="mini" type="danger" @click="deleteRoles(row.id)">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-delete"></use>
            </svg>
            <span>删除</span> 
          </el-button>
          <el-button size="mini" type="warning" @click="showAssignRightsDialog(row)">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-icon-test1"></use>
            </svg> 
            <span>分配权限</span> 
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加角色对话框 -->
    <el-dialog
      v-model="addRolesDialogVisible"
      title="添加角色"
      width="50%"
      @closed="addRolesFormRef.resetFields()"
    >
      <el-form
        ref="addRolesFormRef"
        :model="addRolesForm"
        :rules="rules"
        label-width="120px"
        class="demo-ruleForm"
      >
      <el-form-item label="角色名字" prop="roleName">
        <el-input v-model="addRolesForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="addRolesForm.roleDesc"></el-input>
      </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addRolesDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="addRoles"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      v-model="editRolesDialogVisible"
      title="编辑角色"
      width="50%"
    >
      <el-form
        ref="editRolesFormRef"
        :model="editRolesForm"
        :rules="rules"
        label-width="120px"
        class="demo-ruleForm"
      >
      <el-form-item label="id" prop="id">
        <el-input v-model="editRolesForm.id" disabled></el-input>
      </el-form-item>
      <el-form-item label="角色名字" prop="roleName">
        <el-input v-model="editRolesForm.roleName"></el-input>
      </el-form-item>
      <el-form-item label="角色描述" prop="roleDesc">
        <el-input v-model="editRolesForm.roleDesc"></el-input>
      </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editRolesDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="editRoles"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      v-model="assignRightsDialogVisible"
      title="分配权限"
      width="50%"
      @closed="closeAssignDialog"
    >
      <el-cascader
        v-model="RightsSelected"
        :options="RightsData.options"
        :props="cacasderTrigger"
        @change="cacasderChange"
      ></el-cascader>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignRightsDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="assignSubmit"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus"
import store from "../../Vuex/vuex"
import {reactive, ref, toRefs} from 'vue'
import rules from '../../utilityData/rules.js'

  export default {
    setup(){
      // 获取角色列表
      //#region 
      let rolesListData = reactive({
        data:[]
      })
      const getRolesList = async ()=>{
        const {data: res} = await store.state.$http.get('roles')
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return false
        }
        // 把数据做成响应式数据 --- 暂时没有实现好
        rolesListData.data = res.data

        console.log(rolesListData.data);
      }
      getRolesList()
      //#endregion
  
      // 添加角色
      //#region 
      let addRolesDialogVisible = ref(false)
      const addRolesDialogShow = ()=>{
        addRolesDialogVisible.value = true
      }
      const addRolesFormRef = ref(null)
      const addRolesForm = reactive({
        roleName:'',
        roleDesc:''
      })
      // 同步到服务器
      const addRoles = ()=>{
        addRolesFormRef.value.validate(async (valid)=>{
          if(!valid){
            ElMessage({
              type:'error',
              message: '请正确填写信息'
            })
            return false
          }
          const {data: res} = await store.state.$http.post('roles', addRolesForm)
          if(res.meta.status !== 201){
            ElMessage({
              type:'error',
              message: res.meta.msg
            })
            return 
          }
          getRolesList()
          addRolesDialogVisible.value = false
        })
        
      }
      //#endregion

      // 编辑角色
      //#region
      let editRolesDialogVisible = ref(false)
      const editRolesFormRef = ref(null)
      const editRolesForm = reactive({
        id: 0,
        roleName: 'test',
        roleDesc: 'test'
      })
      
      
      const showEditDialogRoles = (row)=>{
        Object.keys(editRolesForm).forEach(key=>{
          editRolesForm[key] = row[key]
        })

        editRolesDialogVisible.value = true
      }
      const editRoles = ()=>{
        editRolesFormRef.value.validate(async valid=>{
          // 表单认证
          if(!valid){
            ElMessage({
              type:'error',
              message: '请按要求正确填写信息'
            })
          }
          // 向服务器发送请求
          
          const {data: res} = await store.state.$http.put(`roles/${editRolesForm.id}`, {
            roleName:editRolesForm.roleName,
            roleDesc:editRolesForm.roleDesc
          })
          if(res.meta.status !== 200){
            ElMessage({
              type: 'error',
              message: res.meta.msg
            })
            return false
          }
          console.log(res);

          // 同步本地数据
          // console.log(rolesListData.data);
          const idIndex =  rolesListData.data.findIndex(element=>{
            return element.id === editRolesForm.id
          })
          Object.keys(editRolesForm).forEach(element=>{
            rolesListData.data[idIndex][element] = editRolesForm[element]
          })
          // console.log(rolesListData.data[idIndex]);

          editRolesDialogVisible.value = false
        })
      }
      //#endregion

      // 删除角色
      //#region 
      const deleteRoles = (id)=>{
        ElMessageBox.confirm(
          '请确认删除, 此操作不可逆',
          'Warning',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        .then(async ()=>{
          console.log(id);
          const {data: res} = await store.state.$http.delete(`roles/${id}`)
          
          if(res.meta.status !== 200){
            ElMessage({
              type: 'warning',
              message: res.meta.msg,
            })
            return false
          }
          // 同步本地数据
          const idIndex =  rolesListData.data.findIndex(element=>{
            return element.id === id
          })
          console.log(idIndex);
          Object.keys(editRolesForm).forEach(element=>{
            rolesListData.data.splice(idIndex, 1)
          })


          ElMessage({
            type: 'success',
            message: '成功删除',
          })
        })
        .catch(()=>{
          ElMessage({
            type: 'warning',
            message: '取消删除',
          })
        })
      }
      //#endregion

      // 分配权限 assign
      //#region 

      let assignRightsDialogVisible = ref(false)

      // 权限数据
      let RightsData = reactive({
        options: []
      })
      let RightsSelected = ref([])
      let roleId = 0

      let cacasderTrigger = {
        expandTrigger: 'hover',
        multiple:'true',
        value: 'id',
        label: 'authName',
        children: 'children'
      }


      const getAllRightsByTree = async ()=>{
        const {data: res} = await store.state.$http.get('rights/tree')
        // console.log(res);
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          })
          return false
        }
        RightsData.options = res.data
        console.log(RightsData);
      }

      const showAssignRightsDialog = async (row)=>{
        // console.log(row);
        assignRightsDialogVisible.value = true
        // 获取权限数据
        getAllRightsByTree()
        
        // 提交
        roleId = row.id
      }

      // 关闭对话框时的操作
      const closeAssignDialog = ()=>{
        RightsSelected.value = []
      }
      // 级联选择器属性改变的时候
      const cacasderChange =()=>{
        console.log(RightsSelected.value);
      }
      // 提交
      const assignSubmit = async ()=>{
        // 权限去重合并
        let rids = new Set()
        RightsSelected.value.forEach(item=>{
          item.forEach(subItem=>{
            rids.add(subItem)
          })
        })
        const {data: res} = await store.state.$http.post(`roles/${roleId}/rights`, {
          rids: Array.from(rids).join(',')
        })
        if(res.meta.status !== 200){
          ElMessage({
            type: 'warning',
            message: res.meta.msg,
          })
          return
        }
        // 刷新页面
        getRolesList()

        assignRightsDialogVisible.value = false
      }

      //#endregion

      // 删除角色的指定权限
      const handleTagClose = (rightId, roleId, row)=>{
        console.log(rightId, roleId, row);
        let index = row.findIndex(item=>item.id === rightId)
        row.splice(index, 1)
      }

      

      return {
        rolesListData,
        addRolesDialogVisible,
        addRolesDialogShow,
        addRolesFormRef,
        addRolesForm,
        rules,
        addRoles,
        showEditDialogRoles,
        editRolesFormRef,
        editRolesForm,
        editRolesDialogVisible,
        editRoles,
        deleteRoles,
        assignRightsDialogVisible,
        showAssignRightsDialog,
        RightsData,
        RightsSelected,
        cacasderTrigger,
        RightsSelected,
        closeAssignDialog,
        cacasderChange,
        assignSubmit,
        handleTagClose
      }
    }
  }
</script>

<style lang="scss" scoped>
.el-cascader{
  width: 300px;
}
</style>