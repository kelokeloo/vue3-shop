<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    
    <!-- 搜索区域 -->
    <el-row style="margin-bottom: 1rem">
      <!-- 搜索 -->
      <el-col :span="8">
        <el-input
          v-model="queryInfo.query"
          placeholder="Please input"
          @change="search"
        >
          <template #append>
            <el-button type="primary" @click="search"> 搜索</el-button>
          </template>
        </el-input>
      </el-col>
    </el-row>

    <!-- 显示订单 -->
    <el-table :data="orderData.goodsList" stripe style="width: 100%">
      <el-table-column prop="order_id" label="订单id" width="80"/>
      <el-table-column prop="order_number" label="订单号" width="250" />
      <el-table-column prop="is_send" label="是否发货" />
      <el-table-column label="支付方式" >
        <template v-slot="{row}">
          <el-tag :type="order_pay_way[row.order_pay][1]">{{order_pay_way[row.order_pay][0]}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="order_price" label="订单价格" />
      <el-table-column prop="order_number" label="订单数量" />
      <el-table-column prop="pay_status" label="支付状态" >
        <template v-slot="{row}">
          <el-tag :type="row.pay_status !== '0'?'success':'danger'">{{row.pay_status !== '0'?'已支付':'未支付'}}</el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="订单操作" width="400">
        <template v-slot="{row}">
          <el-button type="primary" size='mini'
            @click="showEditDialog(row)"
          >
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-bianji"></use>
            </svg>
          </el-button>        
          <el-button type="danger" size='mini' @click="showLogisticsDialog(row)">物流查询</el-button>
        </template>
      </el-table-column>
      
    </el-table>

    <!-- 订单分页 -->
    <el-pagination
      v-model:currentPage="queryInfo.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="queryInfo.pagesize"
      layout="sizes, prev, pager, next, jumper"
      :total="orderData.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 1rem;"
      background
    >
    </el-pagination>

    <!-- 编辑功能对话框 -->
    <el-dialog
      v-model="EditDialogData.dialogVisible"
      title="编辑订单信息"
      width="50%"
    >
      <el-form
        ref="editFormRef"
        :model="EditDialogData.orderForm"
        :rules="rules"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="订单id">
          <el-input disabled v-model="EditDialogData.order_id"></el-input>
        </el-form-item>
        <el-form-item label="是否发货">
          <el-radio v-model="EditDialogData.orderForm.is_send" label="否">否</el-radio>
          <el-radio v-model="EditDialogData.orderForm.is_send" label="是">是</el-radio>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-radio v-model="EditDialogData.orderForm.order_pay" label="0">未支付</el-radio>
          <el-radio v-model="EditDialogData.orderForm.order_pay" label="1">支付宝</el-radio>
          <el-radio v-model="EditDialogData.orderForm.order_pay" label="2">微信</el-radio>
          <el-radio v-model="EditDialogData.orderForm.order_pay" label="3">银行卡</el-radio>
        </el-form-item>
        <el-form-item label="订单价格">
          <el-input v-model="EditDialogData.orderForm.order_price"></el-input>
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="EditDialogData.orderForm.order_number"></el-input>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-radio v-model="EditDialogData.orderForm.pay_status" label="0">未付款</el-radio>
          <el-radio v-model="EditDialogData.orderForm.pay_status" label="1">已付款</el-radio>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="EditDialogData.dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitEdit"
            >提交更改</el-button
          >
        </span>
      </template>
    </el-dialog>


    <!-- 显示物流对话框 -->
    <el-dialog
      v-model="orderShowData.dialogVisible"
      title="物流信息"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item 
          v-for="(item, index) in orderShowData.list" :key="index"
          :timestamp="item.time" placement="top">
          <el-card>
            <h4>{{item.context}}</h4>
            <p>{{item.ftime}}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

  </div>
</template>

<script>
import { reactive, ref,watch } from "vue"
import store from "../../Vuex/vuex"
import { validateErr } from '../../utilityFunc/errorProcess.js'
import rules from "../../utilityData/rules"
  export default {
    setup(){
      const queryInfo = reactive({
        query:'',
        pagenum: 1,
        pagesize: 5
      })

      const orderData = reactive({
        goodsList: [],
        total: 0
      })

      // 获取数据
      const getOrderList = async ()=>{
        const {data: res} = await store.state.$http.get('orders', {
          params:queryInfo
        })
        if(!validateErr(res, 200)) return false
        orderData.goodsList = res.data.goods
        orderData.total = res.data.total
        // console.log(orderData);
      }

      getOrderList()

      const search = ()=>{
        getOrderList()
      }

      // 展示数据, 支付方式
      const order_pay_way = [
        ['未支付', 'danger'],
        ['支付宝', ''],
        ['微信','success'] ,
        ['银行卡', 'warning']
      ]
      // 分页功能展示
      const handleSizeChange = (newSize)=>{
        queryInfo.pagesize = newSize
        getOrderList()
      }
      const handleCurrentChange = ()=>{
        getOrderList()
      }

      // 编辑功能对话框
      const EditDialogData = reactive({
        dialogVisible: false,
        orderForm:{
          is_send: '', // 是否发货
          order_pay: '0', //支付方式
          order_price: 0, // 订单价格
          order_number: 0, // 订单数量
          pay_status: '0' // 支付状态
        },
        order_id: 0 //订单id
      })

      // 对话框引用
      const editFormRef = ref(null)

      const showEditDialog = (row)=>{
        EditDialogData.dialogVisible = true
        EditDialogData.order_id = row.order_id
        Object.keys(EditDialogData.orderForm).forEach((key)=>{
          EditDialogData.orderForm[key] = row[key]
        })
        // console.log('form', EditDialogData.orderForm);
        // console.log('row',row);
      }
      const submitEdit = async ()=>{
        // console.log('form', EditDialogData.orderForm);
        const {data:res} = await store.state.$http.put(`orders/${EditDialogData.order_id}`, EditDialogData.orderForm)
        // console.log(res);
        if(!validateErr(res, 201)) return false
        getOrderList()
        EditDialogData.dialogVisible = false
      }


      // 查看物流
      const orderShowData = reactive({
        list:[],
        dialogVisible:false
      })

      const showLogisticsDialog = async (row)=>{
        // 导入数据
        ({default:{data:orderShowData.list}} = await import('../../utilityData/orderInfo.js'))
        console.log(orderShowData.list);
        // 显示对话框
        orderShowData.dialogVisible = true
      }


      // watch([EditDialogData], (newVal)=>{
      //   console.log('new', newVal);
      // })

      return {
        // orderDialog,
        orderShowData,
        showLogisticsDialog,
        editFormRef,
        rules,
        EditDialogData,
        handleSizeChange,
        handleCurrentChange,
        queryInfo,
        search,
        orderData,
        order_pay_way,
        submitEdit,
        showEditDialog
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>