<template>
  <div>
    <!-- 导航区 -->
    <el-breadcrumb style="margin-bottom: 2rem">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <div id="main" style="width: 100%;height: 500px"></div>
  </div>
</template>

<script>
import('https://cdn.jsdelivr.net/npm/echarts@5.2.2/dist/echarts.js')
import {onMounted} from 'vue'
import store from '../../Vuex/vuex'

import { validateErr } from '../../utilityFunc/errorProcess'

  export default {
    setup(){
      // 获取图标数据
       

      const getChartData = async ()=>{
        const {data: res} = await store.state.$http.get('reports/type/1')
        if(!validateErr(res,200)) return false
        return res.data
      }

      // getChartData()

      onMounted(async()=>{
         // 基于准备好的dom，初始化echarts实例
        let chartData = await getChartData()
        console.log(chartData);


        var myChart = echarts.init(document.getElementById('main'));

        // 指定图表的配置项和数据
        var  option = {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          legend: {
            data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: 'Email',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
              name: 'Union Ads',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: [220, 182, 191, 234, 290, 330, 310]
            },
            {
              name: 'Video Ads',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: [150, 232, 201, 154, 190, 330, 410]
            },
            {
              name: 'Direct',
              type: 'line',
              stack: 'Total',
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: [320, 332, 301, 334, 390, 330, 320]
            },
            {
              name: 'Search Engine',
              type: 'line',
              stack: 'Total',
              label: {
                show: true,
                position: 'top'
              },
              areaStyle: {},
              emphasis: {
                focus: 'series'
              },
              data: [820, 932, 901, 934, 1290, 1330, 1320]
            }
          ]
        };
        //
        // 合并
        Object.assign(option, chartData)

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
        })
    }

  }
</script>

<style lang="scss" scoped>

</style>