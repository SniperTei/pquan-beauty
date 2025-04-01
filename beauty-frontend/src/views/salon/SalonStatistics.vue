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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { fetchPurchaseRecordStatistics } from '@/apis/purchaseRecord'
import { getDictList } from '@/apis/dict'

// 图表实例
let monthlyChart = null
let typeChart = null

// 图表DOM引用
const monthlyChartRef = ref(null)
const typeChartRef = ref(null)

// 日期选择
const monthDate = ref(new Date().toISOString().slice(0, 7)) // 当前月份，格式：YYYY-MM

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
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '消费类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: []
      }
    ]
  })
}

// 获取月度消费数据
const getMonthlyData = async () => {
  try {
    const [year, month] = monthDate.value.split('-')
    const res = await fetchPurchaseRecordStatistics({ 
      year: parseInt(year),
      month: parseInt(month)
    })
    
    // 处理数据
    const details = res.data.details || []
    const dates = details.map(item => item.time.slice(8)) // 只显示日期部分
    const amounts = details.map(item => item.total)
    
    // 更新柱状图
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
  } catch (error) {
    console.error('获取月度消费数据失败:', error)
    ElMessage.error('获取月度消费数据失败')
  }
}

// 获取消费类型数据
const getTypeData = async () => {
  try {
    const [year, month] = monthDate.value.split('-')
    const res = await fetchPurchaseRecordStatistics({ 
      year: parseInt(year),
      month: parseInt(month)
    })
    
    // 处理数据
    const typeStats = res.data.typeStats || []
    const data = typeStats.map(item => ({
      name: purchaseTypes.value.find(type => type.code === item.type)?.name || item.type,
      value: item.amount,
      count: item.count
    }))
    
    // 更新饼图
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
        data,
        label: {
          formatter: '{b}: {d}%'
        }
      }]
    })
  } catch (error) {
    console.error('获取消费类型数据失败:', error)
    ElMessage.error('获取消费类型数据失败')
  }
}

// 处理月份变化
const handleMonthChange = () => {
  getMonthlyData()
}

const purchaseTypes = ref([])
// 获取字典数据
const loadDicts = async () => {
  try {
    const [typesRes] = await Promise.all([
      getDictList({ type: 'salon_consume' }),
    ])
    purchaseTypes.value = typesRes.data.list
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

onMounted(() => {
  loadDicts()
  // 初始化图表
  initMonthlyChart()
  initTypeChart()
  
  // 获取数据
  getMonthlyData()
  getTypeData()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 销毁图表实例
  monthlyChart?.dispose()
  typeChart?.dispose()
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})

// 监听窗口大小变化
const handleResize = () => {
  monthlyChart?.resize()
  typeChart?.resize()
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
</style>
