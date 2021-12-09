import { ElMessage } from 'element-plus'

export 
function validateErr(res, status){
  if(res.meta.status !== status){
    ElMessage({
      type: 'error',
      message: res.meta.msg
    })
    return false
  }
  else{
    ElMessage({
      type:'success',
      message: res.meta.msg
    })
    return true
  }
}
