// 表单规则集
export default {
  username:[
    { required: true, message: '用户名不能为空', trigger: 'blur'}
  ],
  password:[
    { required: true, message: '密码不能为空', trigger: 'blur'}
  ],
  email:[
    { required: true, message: '邮箱不能为空', trigger: 'blur'}
  ],
  mobile:[
    { required: true, message: '手机号不能为空', trigger: 'blur'}
  ],
  id:[
    { required: true, message: '手机号不能为空', trigger: 'blur'}
  ]
}