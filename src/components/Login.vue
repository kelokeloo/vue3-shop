<template>
  <div class="loginContainer">
    <main class="main border_radius">
      <!-- 表单头部 -->
      <div class="FormHeader">
        <svg class="icon" aria-hidden="true" v-for="(item, index) in goodList" :key="index"
          :style="{left: index * 3 + 'rem'}"  
        >
          <use :xlink:href="'#icon-shiwutubiao-' + item"></use>
        </svg>
      </div>
      <h2>SHOP</h2>
      <!-- 表单内容 -->
      <el-form ref="formRef" :model="loginForm" label-width="5rem"
        :rules="formRules"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" autofocus></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <div class="btn">
          <el-button type="info" @click="signUp">注册</el-button>
          <el-button el-button type="primary" color="#3498DB" @click="login">登录</el-button>
        </div>
      </el-form>
    </main>
  </div>
</template>

<script>
import { ref, reactive, watch} from 'vue'
import { ElMessage } from 'element-plus'
import store from '../Vuex/vuex'
import { useRouter } from 'vue-router'
  export default {
    setup(){
      const goodList = ['22','41','26','18','35','15','21','32','19','03','27']

      // 表单区 ---START---
      const formRef = ref(null)
      let loginForm = reactive({
        username: '',
        password: ''
      })
      const formRules = reactive({
        username:[
          {required: true,message: '用户名不能为空',trigger: 'blur'}
        ],
        password:[
          {required: true,message: '用户名不能为空',trigger: 'blur'}
        ]
      })
      // 表单区 ---END---

      const signUp = ()=>{
        ElMessage({
          message: '暂未开放该功能',
          type: 'warning'
        })
      }
      // 登录验证 --- start
      const $router = useRouter()
      const login = ()=>{
        // console.log(formRef.value);
        formRef.value.validate(async (valid)=>{
          if(!valid){
            ElMessage({ message:'请正确填写账号或密码', type: 'error'})
            return false
          }
          else{
            // 向服务器请求数据
            const {data: res} = await store.state.$http.post('login',{
              username: loginForm.username,
              password: loginForm.password
            });
            if(res.meta.status !== 200){
              ElMessage({ message:'账号或密码错误', type: 'error'})
              return 
            }
            // 保存token
            window.sessionStorage.setItem('token', res.data.token)
            
            $router.push('/home')

            
            ElMessage({
              message:'login',
              type: 'success'
            })
          }
        })
      }
      
      

      return {
        goodList,
        formRef,
        loginForm,
        formRules,
        signUp,
        login
      }
    }
  }
</script>

<style lang="scss" scoped>
$themeColor : #3498DB;
.loginContainer {
  height: 100vh;
  background-color: #3498DB;
  display: flex;
  justify-content: center;
  align-items: center;
}

// 登录头部样式
main.main{
  .FormHeader{
    svg{
      width: 4rem;
      height: 4rem;
      position: absolute;
    }
    position: absolute;
    left: -2rem;
    top: -2rem;
  }
  h2{
    margin-top: 3rem;
    margin-left: 3rem;
    font-size: 2rem;
    color: $themeColor
  }
  width: 30rem;
  height: 20rem;
  background-color: #ECF0F1 ;
  
  position: relative;
}
// 表单样式
main.main .el-form{
  .btn{
    .el-button:first-of-type{
      margin-left: auto;
    }
    display: flex;

  }
  padding: 1.5rem 4rem;
}

</style>