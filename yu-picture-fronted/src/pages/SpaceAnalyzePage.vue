<template>
  <div id="spaceAnalyzePage">
    <h2>空间图库分析 - 空间 id: <a-typography-text type="secondary">{{ spaceId }}</a-typography-text></h2>
    
    <div style="margin-bottom: 24px" />
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :md="12">
        <a-card title="存储空间" class="analyze-card" :loading="loading">
          <div v-if="usageAnalyzeData">
            <div class="usage-text">{{ formatSize(usageAnalyzeData.usedSize) }} / {{ usageAnalyzeData.maxSize ? formatSize(usageAnalyzeData.maxSize) : '不限制' }}</div>
            <VChart :option="usageSizeGaugeOption" class="chart-gauge" autoresize />
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :md="12">
        <a-card title="图片数量" class="analyze-card" :loading="loading">
          <div v-if="usageAnalyzeData">
             <div class="usage-text">{{ usageAnalyzeData.usedCount }} / {{ usageAnalyzeData.maxCount || '不限制' }}</div>
             <VChart :option="usageCountGaugeOption" class="chart-gauge" autoresize />
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :md="12">
         <a-card title="空间图片分类分析" class="analyze-card" :loading="loading">
            <VChart :option="categoryBarChartOption" class="chart-bar" autoresize />
         </a-card>
      </a-col>

      <a-col :xs="24" :md="12">
         <a-card title="空间图片标签分析" class="analyze-card" :loading="loading">
            <VChart :option="tagWordCloudOption" class="chart-wordcloud" autoresize />
         </a-card>
      </a-col>
      
      <a-col :xs="24" :md="24">
         <a-card title="空间图片大小分析" class="analyze-card" :loading="loading">
            <VChart :option="sizePieChartOption" class="chart-pie" autoresize />
         </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart, BarChart, GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import 'echarts-wordcloud'
import { 
  getSpaceUsageAnalyzeUsingPost, 
  getSpaceCategoryAnalyzeUsingPost,
  getSpaceTagAnalyzeUsingPost,
  getSpaceSizeAnalyzeUsingPost
} from '@/api/spaceAnalyzeController'
import { formatSize } from '@/utils'

use([
  CanvasRenderer,
  PieChart,
  BarChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const route = useRoute()
const spaceId = computed(() => route.query.spaceId as string || '')
const loading = ref(true)

const usageAnalyzeData = ref<API.SpaceUsageAnalyzeResponse>()
const categoryAnalyzeData = ref<API.SpaceCategoryAnalyzeResponse[]>([])
const tagAnalyzeData = ref<API.SpaceTagAnalyzeResponse[]>([])
const sizeAnalyzeData = ref<API.SpaceSizeAnalyzeResponse[]>([])


const fetchUsageAnalyze = async () => {
    try {
        const res = await getSpaceUsageAnalyzeUsingPost({
           spaceId: spaceId.value || undefined,
           queryAll: !spaceId.value,
           queryPublic: false,
        })
        if (res.data.code === 0) {
            usageAnalyzeData.value = res.data.data
        } else {
            message.error('获取使用情况失败，' + res.data.message)
        }
    } catch {
        message.error('获取使用情况失败')
    }
}

const fetchCategoryAnalyze = async () => {
    try {
        const res = await getSpaceCategoryAnalyzeUsingPost({
           spaceId: spaceId.value || undefined,
           queryAll: !spaceId.value,
           queryPublic: false,
        })
        if (res.data.code === 0) {
            categoryAnalyzeData.value = res.data.data ?? []
        } else {
            message.error('获取分类分析失败，' + res.data.message)
        }
    } catch {
        message.error('获取分类分析失败')
    }
}

const fetchTagAnalyze = async () => {
    try {
        const res = await getSpaceTagAnalyzeUsingPost({
           spaceId: spaceId.value || undefined,
           queryAll: !spaceId.value,
           queryPublic: false,
        })
        if (res.data.code === 0) {
            tagAnalyzeData.value = res.data.data ?? []
        } else {
            message.error('获取标签分析失败，' + res.data.message)
        }
    } catch {
        message.error('获取标签分析失败')
    }
}

const fetchSizeAnalyze = async () => {
    try {
        const res = await getSpaceSizeAnalyzeUsingPost({
           spaceId: spaceId.value || undefined,
           queryAll: !spaceId.value,
           queryPublic: false,
        })
        if (res.data.code === 0) {
             sizeAnalyzeData.value = res.data.data ?? []
        } else {
             message.error('获取大小分析失败，' + res.data.message)
        }
    } catch {
        message.error('获取大小分析失败')
    }
}

const fetchAllData = async () => {
    loading.value = true
    await Promise.all([
        fetchUsageAnalyze(),
        fetchCategoryAnalyze(),
        fetchTagAnalyze(),
        fetchSizeAnalyze()
    ])
    loading.value = false
}

onMounted(() => {
    fetchAllData()
})

watch(() => spaceId.value, () => {
    fetchAllData()
})

// ----- Charts Options -----

const getGaugeOption = (ratio: number) => {
   return {
        series: [
        {
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            pointer: { show: false },
            progress: {
               show: true,
               overlap: false,
               roundCap: true,
               clip: false,
               itemStyle: { borderWidth: 1, borderColor: '#464646' }
            },
            axisLine: { lineStyle: { width: 40 } },
            splitLine: { show: false, distance: 0, length: 10 },
            axisTick: { show: false },
            axisLabel: { show: false, distance: 50 },
            data: [
               { value: ratio * 100, name: '使用率', title: { offsetCenter: ['0%', '-30%'] }, detail: { valueAnimation: true, offsetCenter: ['0%', '20%'] } }
            ],
            title: { fontSize: 14 },
            detail: { width: 50, height: 14, fontSize: 18, color: 'inherit', borderColor: 'inherit', borderRadius: 20, borderWidth: 1, formatter: '{value}%' }
        }
        ]
    };
}

const usageSizeGaugeOption = computed(() => {
   const ratio = usageAnalyzeData.value?.sizeUsageRatio ?? 0;
   return getGaugeOption(ratio);
});

const usageCountGaugeOption = computed(() => {
   const ratio = usageAnalyzeData.value?.countUsageRatio ?? 0;
   return getGaugeOption(ratio);
});


const categoryBarChartOption = computed(() => {
   const data = categoryAnalyzeData.value;
   return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['图片数量', '图片总大小(MB)'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: [ { type: 'category', data: data.map(item => item.category) } ],
        yAxis: [ 
            { type: 'value', name: '图片数量' },
            { type: 'value', name: '图片总大小(MB)' }
         ],
        series: [
        {
            name: '图片数量',
            type: 'bar',
            data: data.map(item => item.count)
        },
        {
            name: '图片总大小(MB)',
            type: 'bar',
            yAxisIndex: 1,
            data: data.map(item => Number(((item.totalSize ?? 0) / (1024 * 1024)).toFixed(2)))
        }
        ]
    };
});


const tagWordCloudOption = computed(() => {
   const data = tagAnalyzeData.value;
   return {
       tooltip: { show: true },
       series: [{
           type: 'wordCloud',
           shape: 'circle',
           left: 'center',
           top: 'center',
           width: '100%',
           height: '100%',
           right: null,
           bottom: null,
           sizeRange: [12, 60],
           rotationRange: [-90, 90],
           rotationStep: 45,
           gridSize: 8,
           drawOutOfBound: false,
           textStyle: {
               fontFamily: 'sans-serif',
               fontWeight: 'bold',
               color: function () {
                   return 'rgb(' + [
                       Math.round(Math.random() * 160),
                       Math.round(Math.random() * 160),
                       Math.round(Math.random() * 160)
                   ].join(',') + ')';
               }
           },
           emphasis: {
               focus: 'self',
               textStyle: { textShadowBlur: 10, textShadowColor: '#333' }
           },
           data: data.map(item => ({ name: item.tag, value: item.count }))
       }]
   };
});


const sizePieChartOption = computed(() => {
    const data = sizeAnalyzeData.value;
    return {
        tooltip: { trigger: 'item' },
        legend: { top: '5%', left: 'center' },
        series: [
        {
            name: '大小分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: {
               label: { show: true, fontSize: 20, fontWeight: 'bold' }
            },
            labelLine: { show: false },
            data: data.map(item => ({ value: item.count, name: item.sizeRange }))
        }
        ]
    };
})

</script>

<style scoped>
#spaceAnalyzePage {
  margin-bottom: 24px;
}
.analyze-card {
  height: 100%;
}
.chart-gauge {
  height: 250px;
}
.chart-bar {
  height: 350px;
}
.chart-wordcloud {
   height: 350px;
}
.chart-pie {
   height: 350px;
}
.usage-text {
    text-align: center;
    margin-bottom: 16px;
    font-size: 16px;
}

@media (max-width: 768px) {
  #spaceAnalyzePage h2 {
    font-size: 18px;
  }

  .chart-gauge {
    height: 180px;
  }

  .chart-bar {
    height: 250px;
  }

  .chart-wordcloud {
    height: 250px;
  }

  .chart-pie {
    height: 250px;
  }

  .usage-text {
    font-size: 14px;
    margin-bottom: 8px;
  }
}
</style>
