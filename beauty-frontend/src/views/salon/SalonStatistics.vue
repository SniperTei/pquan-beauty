<template>
  <div class="statistics-container">
    <div class="page-header">
      <div class="title-section">
        <h2>经营统计</h2>
        <span class="subtitle">查看美容院的经营数据统计</span>
      </div>
    </div>

    <!-- 图表展示区域 -->
    <el-row :gutter="20">
      <!-- 月度消费柱状图 -->
      <el-col :span="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>月度消费统计</span>
              <el-date-picker
                v-model="monthDate"
                type="month"
                placeholder="选择月份"
                format="YYYY-MM"
                value-format="YYYY-MM"
                @change="handleMonthChange"
              />
            </div>
          </template>
          <div ref="monthlyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 消费类型饼图 -->
      <el-col :span="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>当月消费类型占比</span>
            </div>
          </template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改注射产品用量统计部分 -->
    <el-row :gutter="20">
      <!-- 按支计数的产品 -->
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>注射产品用量对比(支)</span>
              <div class="month-picker-group">
                <el-date-picker
                  v-model="usageMonth1"
                  type="month"
                  placeholder="选择月份"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  @change="handleUsageMonthChange"
                />
                <span class="vs-text">VS</span>
                <el-date-picker
                  v-model="usageMonth2"
                  type="month"
                  placeholder="选择月份"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  @change="handleUsageMonthChange"
                />
              </div>
            </div>
          </template>
          <div ref="usageChartRef1" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 按单位计数的产品 -->
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>注射产品用量对比(单位)</span>
              <div class="month-picker-group">
                <span>同左</span>
              </div>
            </div>
          </template>
          <div ref="usageChartRef2" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { fetchPurchaseRecordStatistics } from '@/apis/purchaseRecord'
import { getDictList } from '@/apis/dict'
import { fetchInjectProductUsage } from '@/apis/injectProduct'

// 图表实例
let monthlyChart = null
let typeChart = null
let usageChart1 = null // 按支计数的图表
let usageChart2 = null // 按单位计数的图表

// 图表DOM引用
const monthlyChartRef = ref(null)
const typeChartRef = ref(null)
const usageChartRef1 = ref(null)
const usageChartRef2 = ref(null)

// 日期选择
const monthDate = ref(new Date().toISOString().slice(0, 7)) // 当前月份，格式：YYYY-MM
const usageMonth1 = ref('') // 第一个月份
const usageMonth2 = ref('') // 第二个月份

// 初始化月度消费柱状图
const initMonthlyChart = () => {
  monthlyChart = echarts.init(monthlyChartRef.value)
  monthlyChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '金额 (元)'
    },
    series: [
      {
        name: '消费金额',
        type: 'bar',
        data: [],
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  })
}

// 初始化消费类型饼图
const initTypeChart = () => {
  typeChart = echarts.init(typeChartRef.value)
  typeChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {d}%'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: []
      }
    ]
  })
}

// 初始化注射用量图表
const initUsageCharts = () => {
  const commonOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: { top: 10 },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: []
  }

  usageChart1 = echarts.init(usageChartRef1.value)
  usageChart2 = echarts.init(usageChartRef2.value)
  
  usageChart1.setOption(commonOptions)
  usageChart2.setOption(commonOptions)
}

// 获取统计数据并更新两个图表
const getStatisticsData = async () => {
  try {
    const [year, month] = monthDate.value.split('-')
    const res = await fetchPurchaseRecordStatistics({ 
      year: parseInt(year),
      month: parseInt(month)
    })
    
    // 更新柱状图数据
    const details = res.data.details || []
    const dates = details.map(item => item.time.slice(8)) // 只显示日期部分
    const amounts = details.map(item => item.total)
    
    monthlyChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const date = params[0].name
          const detail = details.find(d => d.time.slice(8) === date)
          if (!detail) return ''
          
          let html = `${month}月${date}日<br/>总金额：¥${detail.total}<br/>`
          html += `总笔数：${detail.count}笔<br/><br/>`
          
          detail.types.forEach(type => {
            if (type.count > 0) {
              const typeName = purchaseTypes.value.find(t => t.code === type.type)?.name || type.type
              html += `${typeName}：¥${type.amount} (${type.count}笔)<br/>`
            }
          })
          return html
        }
      },
      xAxis: { 
        data: dates,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '金额 (元)',
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [{
        name: '消费金额',
        type: 'bar',
        data: amounts,
        itemStyle: {
          color: '#409EFF'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '¥{c}'
        }
      }]
    })

    // 更新饼图数据
    const typeStats = res.data.typeStats || []
    const pieData = typeStats
      .filter(item => item.amount > 0)
      .map(item => ({
        name: purchaseTypes.value.find(type => type.code === item.type)?.name || item.type,
        value: item.amount,
        count: item.count
      }))
    
    typeChart.setOption({
      title: {
        text: `总金额：¥${res.data.totalAmount}\n总笔数：${res.data.count}笔`,
        left: 'center',
        top: 'center',
        textStyle: {
          fontSize: 16,
          color: '#303133',
          lineHeight: 24
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const percentage = ((params.value / res.data.totalAmount) * 100).toFixed(2)
          return `${params.name}<br/>金额：¥${params.value}<br/>笔数：${params.data.count}笔<br/>占比：${percentage}%`
        }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {d}%'
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: pieData
      }]
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 获取注射用量统计数据
const getUsageStats = async () => {
  if (!usageMonth1.value || !usageMonth2.value) return
  
  try {
    const [res1, res2] = await Promise.all([
      fetchInjectProductUsage({ yearMonth: usageMonth1.value }),
      fetchInjectProductUsage({ yearMonth: usageMonth2.value })
    ])
    
    // 按单位类型分类产品
    const getProductsByUnit = (products, unit) => {
      return products.filter(p => p.dictRemarks === unit)
    }
    
    // 处理"支"计数的产品
    const products1ByZhi = getProductsByUnit(res1.data.products, '支')
    const products2ByZhi = getProductsByUnit(res2.data.products, '支')
    const allProductsZhi = new Set([
      ...products1ByZhi.map(p => p.name),
      ...products2ByZhi.map(p => p.name)
    ])
    
    // 处理"单位"计数的产品
    const products1ByUnit = getProductsByUnit(res1.data.products, '单位')
    const products2ByUnit = getProductsByUnit(res2.data.products, '单位')
    const allProductsUnit = new Set([
      ...products1ByUnit.map(p => p.name),
      ...products2ByUnit.map(p => p.name)
    ])
    
    // 更新"支"计数图表
    updateUsageChart(
      usageChart1,
      Array.from(allProductsZhi),
      products1ByZhi,
      products2ByZhi,
      '支'
    )
    
    // 更新"单位"计数图表
    updateUsageChart(
      usageChart2,
      Array.from(allProductsUnit),
      products1ByUnit,
      products2ByUnit,
      '单位'
    )
  } catch (error) {
    console.error('获取注射用量统计失败:', error)
    ElMessage.error('获取注射用量统计失败')
  }
}

// 更新图表的公共方法
const updateUsageChart = (chart, products, data1, data2, unit) => {
  const series = [
    {
      name: usageMonth1.value,
      type: 'bar',
      data: products.map(name => {
        const product = data1.find(p => p.name === name)
        return product ? product.quantity : 0
      })
    },
    {
      name: usageMonth2.value,
      type: 'bar',
      data: products.map(name => {
        const product = data2.find(p => p.name === name)
        return product ? product.quantity : 0
      })
    }
  ]
  
  chart.setOption({
    legend: {
      data: [usageMonth1.value, usageMonth2.value]
    },
    xAxis: {
      data: products
    },
    series,
    tooltip: {
      formatter: function(params) {
        const productName = params[0].axisValue
        let html = `${productName}<br/>`
        params.forEach(param => {
          html += `${param.seriesName}: ${param.value}${unit}<br/>`
        })
        return html
      }
    }
  })
}

// 处理月份变化
const handleMonthChange = () => {
  getStatisticsData()
}

// 处理日期变化
const handleUsageMonthChange = () => {
  if (usageMonth1.value && usageMonth2.value) {
    getUsageStats()
  }
}

const purchaseTypes = ref([])
// 获取字典数据
const loadDicts = async () => {
  try {
    const [typesRes] = await Promise.all([
      getDictList({ type: 'purchaseType' }),
    ])
    purchaseTypes.value = typesRes.data.list
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

onMounted(() => {
  loadDicts()
  initMonthlyChart()
  initTypeChart()
  initUsageCharts()
  getStatisticsData()
  
  // 设置默认对比月份为当前月和上个月
  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7)
  now.setMonth(now.getMonth() - 1)
  const lastMonth = now.toISOString().slice(0, 7)
  
  usageMonth1.value = lastMonth
  usageMonth2.value = currentMonth
  
  getUsageStats()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 销毁图表实例
  monthlyChart?.dispose()
  typeChart?.dispose()
  usageChart1?.dispose()
  usageChart2?.dispose()
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})

// 监听窗口大小变化
const handleResize = () => {
  monthlyChart?.resize()
  typeChart?.resize()
  usageChart1?.resize()
  usageChart2?.resize()
}
</script>

<style lang="scss" scoped>
.statistics-container {
  padding: 20px;
  
  .page-header {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    
    .title-section {
      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: #1f2f3d;
      }
      
      .subtitle {
        font-size: 14px;
        color: #909399;
        margin-top: 8px;
        display: block;
      }
    }
  }
  
  .chart-card {
    margin-bottom: 20px;
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chart-container {
      height: 400px;
      width: 100%;
    }
  }
}

.month-picker-group {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .vs-text {
    font-size: 14px;
    color: #909399;
  }
  
  span {
    color: #909399;
    font-size: 14px;
  }
}
</style>
