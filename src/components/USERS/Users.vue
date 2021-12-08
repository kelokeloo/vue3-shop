<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 渲染搜索区域 -->
    <el-row class="search margin-bottom">
      <el-col :span="8">
        <!-- 搜索框 -->
        <el-input
          v-model="queryInfo.query"
          placeholder="请输入搜索内容"
          @change="getUserList"
        >
          <template #append>
            <el-button
              @click="getUserList"
            >
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-icon-test"></use>
              </svg>
            </el-button>
          </template>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button style="margin-left: 1rem;" type="primary" color="#3498DB" @click="showAddDialog">添加用户</el-button>
      </el-col>
    </el-row>
    
    <!-- 渲染表格 start-->
    <el-table :data="userList.data.users" border stripe style="width: 100%;" class="margin-bottom">
      <el-table-column type="index" label="#"/>
      <el-table-column prop="username" label="姓名" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="mobile" label="电话" />
      <el-table-column prop="role_name" label="角色" />
      <el-table-column prop="mg_state" label="状态" width="80px" >
        <template v-slot="scope">
          <el-switch v-model="scope.row.mg_state" 
            @change="changeUserStatus(scope.row)"
            active-color="#3498DB" inactive-color="#BDC3C7" />

        </template>
      </el-table-column>
      <!-- 列表操作区域 -->
      <el-table-column label="操作" >
        <!-- 从el-table解构出row -->
        <template v-slot="{row}">
          <!-- 修改用户信息 -->
          <el-button size="mini" color="#3498DB"
            @click="editUserInfo(row)"
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-bianji"></use>
            </svg>
          </el-button>
          <!-- 删除用户 -->
          <el-button size="mini" color="#E74C3C"
            @click="deleteUser(row.id)"
          >
            <svg class="icon" aria-hidden="true" style="color: white; ">
              <use xlink:href="#icon-delete"></use>
            </svg>
          </el-button>
          <!-- 分配角色 -->
          <el-tooltip
            effect="dark"
            content="分配角色"
            placement="top"
          >
          <el-button size="mini" color="#F1C40F"
            @click="showChoiceRolesDialog(row)">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-icon-test1"></use>
            </svg>
          </el-button>
          </el-tooltip>
        </template>
        
      </el-table-column>
    </el-table>
    <!-- 渲染表格 end-->

    <!-- 分页区域 start -->
    <el-pagination
      v-model:currentPage="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 30]"
      :page-size="queryInfo.pagesize"
      layout="sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
    </el-pagination>

    <!-- 分页区域 end-->

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addUserDialog"
      title="添加用户"
      width="50%"
      @closed="
        // 清理表单
        addUserFormRef.resetFields()"
    >
        <el-form
          ref="addUserFormRef"
          :model="addUserForm"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="用户密码" prop="password">
            <el-input v-model="addUserForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      <template #footer>
        <span>
          <el-button @click="addUserDialog = false">取消</el-button>
          <el-button type="primary" @click="addUser"
            >添加</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 修改信息对话框 -->
    <el-dialog
      v-model="editUserInfoDialogVisible"
      title="修改用户信息"
      width="50%"
    >
      <el-form
        ref="editUserInfoFormRef"
        :model="userInfo"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userInfo.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="id" prop="id">
          <el-input v-model="userInfo.id"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userInfo.mobile"></el-input>
        </el-form-item>

      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editUserInfoDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="putUserInfo"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="ChoiceRolesDialogVisible"
      title="分配角色"
      width="50%"
    >
    <div class="assignRolesDialog">
      <h4 style="margin-bottom: 1rem;">当前角色</h4>
      <el-input v-model="curRole" disabled style="margin-bottom: 1rem;"/>
      <el-select v-model="RoleSelected.selected" placeholder="Select"
      >
        <el-option
          v-for="item in RoleOptions.options"
          :key="item.id"
          :label="item.roleName"
          :value="item.id"
        >
        </el-option>
      </el-select>
    </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ChoiceRolesDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="assignRoleSubmit"
            >Confirm</el-button
          >
        </span>
      </template>
    </el-dialog>


  </div>
</template>

<script>
import { ElMessage } from "element-plus"
import { reactive, watch, ref} from "vue-demi"
import store from "../../Vuex/vuex"
import rules from "../../utilityData/rules.js"

  export default {
    setup(){
      


      let userList = reactive({
        data:{}
      })
      const queryInfo = reactive({
        query:'',
        pagenum: 1,
        pagesize: 5
      })
      let total = ref(0)
      // 获取用户数据列表
      //#region 
      const getUserList = async ()=>{
        const {data: res} = await store.state.$http.get('users', {
          params: queryInfo
        })
        if(res.meta.status !== 200){
          ElMessage({
            message: '获取用户列表失败',
            type:'error'
          })
          return false
        }
        // console.log(res.data);
        total.value = res.data.total
        userList.data = res.data
      }
      getUserList()
      //#endregion


      // 分页功能区域
      //#region 
      const handleSizeChange = (newSize)=>{
        queryInfo.pagesize = newSize
        getUserList()
      }
      const handleCurrentChange = (newPage)=>{
        queryInfo.pagenum = newPage
        getUserList()
      }
      //#endregion


      // 添加用户区域
      //#region 
      let addUserDialog = ref(false)
      const showAddDialog = ()=>{
        addUserDialog.value = true
      }
      const addUserFormRef = ref(null)
      const addUserForm = reactive({
        username:'',
        password:'',
        email:'',
        mobile:''
      })
      
      const addUser = ()=>{
        addUserFormRef.value.validate(async (valid)=>{
          if(valid === true){
            //验证成功向服务器发送请求
            const {data: res} = await store.state.$http.post('users', addUserForm)
            if(res.meta.status !== 201){
              ElMessage({
                type: 'error',
                message: res.meta.msg
              })
            }
            else{
              ElMessage({
                type: 'success',
                message: res.meta.msg
              })
              getUserList()
            }
            addUserDialog.value = false
          }
          else{
            // 验证失败，提示输入有误
            ElMessage({
              type: 'error',
              message: '信息填写有误'
            })
          }
        })
      }
      //#endregion

      // 存储用户信息
      const userInfo = reactive({
        "id": 0,
        "username": "",
        "mobile": "",
        "email": "",
        "rid":0
      })

      // 改变用户状态区域
      //#region 
      const changeUserStatus = async (row)=>{
        // 向服务器发送请求，改变用户状态
        const {data: res} = await  store.state.$http.put(`users/${row.id}/state/${row.mg_state}`)
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: res.meta.msg
          }
          )
        }
      }

      
      //#endregion

      // 修改用户信息
      //#region 
        // 修改用户的对话框
      let editUserInfoDialogVisible = ref(false)
      const editUserInfoFormRef = ref(null)

        // 根据id获取用户信息
      const getUserInfo = async (id)=>{
        const {data: res} = await store.state.$http.get(`users/${id}`)
        // 赋值
        Object.keys(res.data).forEach(key=>{
          userInfo[key] = res.data[key]
        })
      }
        // 提交更改
      const putUserInfo = async ()=>{
        const {data : res} = await store.state.$http.put(`users/${userInfo.id}`, {
          id: userInfo.id,
          email: userInfo.email,
          mobile: userInfo.mobile
        })
        // 更新数据列表
        getUserList()
        editUserInfoDialogVisible.value = false
      }
      const editUserInfo = (row)=>{
        editUserInfoDialogVisible.value = true
        getUserInfo(row.id)
        // 提交更改
      }
      //#endregion


      // 删除用户
      //#region 
      const deleteUser =  (id)=>{
        
        ElMessageBox.confirm(
          '将永远删除该用户，请再次确认是否删除',
          'Warning',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        .then(async () => {
          const {data: res} = await store.state.$http.delete(`users/${id}`)
          let type = 'success'
          if(res.meta.status !== 200){
            type='error'
          }
          // 刷新用户列表
          const idIndex = userList.data.users.findIndex(element=>element.id === id)
          userList.data.users.splice(idIndex, 1)

          ElMessage({
            type: 'success',
            message: res.meta.msg,
          })
        })
        .catch(() => {
          ElMessage({
            type: 'info',
            message: '已取消删除',
          })
        })
      }
      //#endregion

      // 分配角色
      //#region 
      // 对话框数据
        // 当前角色
      let curRole = ref('') 
      let RoleOptions = reactive({
        options:[]
      })
      let RoleSelected = reactive({
        selected:null
      })
      let UserID = ref(0)

      //获取角色列表
      const getRolesList = async ()=>{
        const {data: res} = await store.state.$http.get('roles')
        // console.log('角色列表');
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: '获取角色列表失败'
          })
          return false
        }
        // console.log(res.data);
        RoleOptions.options = res.data
      }
      

      const showChoiceRolesDialog = async (row)=>{
        ChoiceRolesDialogVisible.value=true
        curRole.value = row.role_name
        UserID.value = row.id

        getRolesList()
        // 提交
      }
      let ChoiceRolesDialogVisible = ref(false)

      const assignRoleSubmit = async ()=>{
        const {data: res} = await store.state.$http.put(`users/${UserID.value}/role`, {
          rid: RoleSelected.selected
        })
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message: '获取角色列表失败'
          })
          return false
        }
        // 刷新
        getUserList()
        ChoiceRolesDialogVisible.value=false
      }


      //#endregion

      // watch([RoleSelected], (newValue)=>{
      //   console.log('新值', newValue);
      // })
      return {
        userList,
        queryInfo,
        getUserList,
        total,
        handleSizeChange,
        handleCurrentChange,
        showAddDialog,
        addUserDialog,
        addUserFormRef,
        addUserForm,
        rules,
        addUser,
        changeUserStatus,
        editUserInfo,
        editUserInfoDialogVisible,
        userInfo,
        putUserInfo,
        deleteUser,
        ChoiceRolesDialogVisible,
        showChoiceRolesDialog,
        curRole,
        RoleOptions,
        RoleSelected,
        assignRoleSubmit
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>