// 表单规则集
const required = { required: true, message: '用户名不能为空', trigger: 'blur'}


const rules = {
  username:[],
  password:[],
  email:[],
  mobile:[],
  id:[],
  roleName:[],
  roleDesc:[]
}
Object.keys(rules).forEach(key=>{
  rules[key].push(required)
})


export default rules