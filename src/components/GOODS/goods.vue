<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容头部 -->
    <el-row style="margin-bottom: 1rem">
      <!-- 搜索 -->
      <el-col :span="6">
        <el-input
          v-model="queryInfo.query"
          placeholder="Please input"
          class="input-with-select"
          @change="search"
        >
          <template #append>
            <el-button type="primary" @click="search"> 搜索</el-button>
          </template>
        </el-input>
      </el-col>
      <!-- 添加用户 -->
      <el-col :span="4">
        <el-button type="primary" style="margin-left:1rem;" @click="addGoods">添加商品</el-button>
      </el-col>
    </el-row>
    
    <!-- 内容主体(表格) -->
    <el-table :data="tableData.goodsList" stripe style="width: 100%">
      <el-table-column type="index" />
      <el-table-column prop="goods_name" label="商品名称"  />
      <el-table-column prop="goods_price" label="商品价格" width="100" />
      <el-table-column prop="goods_number" label="商品数量" width="100"/>
      <el-table-column prop="goods_weight" label="商品重量" width="100"/>
      <el-table-column prop="add_time" label="商品添加时间" width="150">
        <template v-slot="{row}">
          {{timeFormat(row.add_time)}}
        </template>
      </el-table-column>
      <el-table-column label="编辑" width="180">
        <template v-slot="{row}">
          <el-button type="primary" size="mini">编辑</el-button>
          <el-button type="danger" size="mini"
            @click="deleteGoods(row.goods_id)"
          ><span style="color:white;">删除</span></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- pagination -->
    <el-pagination
      v-model:currentPage="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="sizes, prev, pager, next, jumper"
      :total="tableData.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 1rem;" 
    >
    </el-pagination>
  </div>
</template>

<script>
import { reactive, computed } from 'vue'
import store from '../../Vuex/vuex'
import { ElMessage } from 'element-plus'
import router from '../../router/route'
  export default {
    setup(){
      // 商品数据
      const tableData = reactive({
        goodsList: [],
        total: 0
      })

      // 获取商品数据并渲染
      const queryInfo = reactive({
        query:'',
        pagenum: 1,
        pagesize: 5
      })
      // 请求数据
      //#region 
        // 获取商品数据
      const getGoodsList = async ()=>{
        const {data: res} = await store.state.$http.get('goods', {
          params: queryInfo
        })
        // console.log(res);
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message:res.meta.msg
          })
          return false
        }
        // 
        tableData.goodsList = res.data.goods
        tableData.total = res.data.total
        // console.log(tableData);
      }
      getGoodsList()
        // 时间转换
      const timeFormat = (time)=>{
        const addTime = new Date(time)
        const yy = addTime.getFullYear()
        const mm = addTime.getMonth() + 1
        const dd = addTime.getDay() + 1
        
        const tt = addTime.getHours()
        const min = addTime.getMinutes()
        const sec = addTime.getSeconds()
        return `${yy}-${mm}-${dd} ${tt}:${min}:${sec}`
      }
      

      //#endregion

      // 查询
      const search = ()=>{
        getGoodsList()
      }


      // 分页
      const handleSizeChange = (newSize)=>{
        queryInfo.pagesize = newSize
        getGoodsList()
      }
      const handleCurrentChange = (newPage)=>{
        
        getGoodsList()
      }

      // 删除商品
      const deleteGoods = async (id)=>{
        const {data:res} = await store.state.$http.delete(`goods/${id}`)
        if(res.meta.status !== 200){
          ElMessage({
            type:'error',
            message:res.meta.msg
          })
          return false
        }
        ElMessage({
          type:'success',
          message:res.meta.msg
        })
        getGoodsList()
      }

      // 添加商品
      const addGoods = ()=>{
        router.push('/home/addGood')
      }

      return {
        deleteGoods,
        handleCurrentChange,
        handleSizeChange,
        queryInfo,
        tableData,
        timeFormat,
        search,
        addGoods
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>