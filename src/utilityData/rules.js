// 表单规则集
const required = { required: true, message: '参数不能为空', trigger: 'blur'}


const rules = {
  username:[],
  password:[],
  email:[],
  mobile:[],
  id:[],
  roleName:[],
  roleDesc:[],
  goods_name:[],
  goods_cat:[],
  goods_price:[],
  goods_number:[],
  goods_weight:[],
  goods_introduce:[],
}
Object.keys(rules).forEach(key=>{
  rules[key].push(required)
})


export default rules