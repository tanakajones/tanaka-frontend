<template>
  <div class="space-y-6">
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="(stat, index) in stats" :key="index" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group">
         <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Icon :name="stat.icon" class="w-16 h-16" :class="stat.textClass" />
         </div>
         <div>
            <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
         </div>
         <div class="flex items-center gap-2 text-xs font-medium">
            <span :class="stat.trend > 0 ? 'text-green-600' : 'text-red-600'">
              {{ stat.trend > 0 ? '+' : ''}}{{ stat.trend }}%
            </span>
            <span class="text-gray-400">vs last month</span>
         </div>
      </div>
    </div>

    <!-- AI Insights Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <!-- Infrastructure Health Prediction -->
       <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Icon name="heroicons:chart-bar-square" class="text-primary-600" />
              AI Failure Prediction
            </h3>
            <button class="text-sm text-primary-600 hover:text-primary-700 font-medium">View Details</button>
          </div>
          
          <div v-if="predictions.length > 0" class="space-y-4">
             <div v-for="pred in predictions.slice(0, 3)" :key="pred.ward" class="p-4 rounded-xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/30 transition-colors">
                <div class="flex justify-between items-center mb-2">
                   <h4 class="font-bold text-gray-800">{{ pred.ward }}</h4>
                   <span :class="getRiskColor(pred.riskLevel)" class="px-2 py-1 rounded text-xs font-bold">{{ pred.riskLevel }} Risk</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                   <div class="bg-primary-600 h-2 rounded-full" :style="`width: ${pred.healthScore}%`"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                   <span>Health Score: {{ pred.healthScore }}/100</span>
                   <span>Probable Fail: {{ pred.predictedFailureDate || 'N/A' }}</span>
                </div>
             </div>
          </div>
          <div v-else class="text-center py-8 text-gray-400">
             <Icon name="heroicons:cpu-chip" class="w-12 h-12 mx-auto mb-2 opacity-50" />
             <p>No predictions available. AI model training...</p>
          </div>
       </div>

       <!-- Hotspots Map -->
       <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Icon name="heroicons:fire" class="text-red-500" />
              Hotspot Detection
            </h3>
            <span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full animate-pulse">Live</span>
          </div>
          
          <div class="flex-1 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[300px]">
             <!-- Placeholder for Leaflet Map -->
             <div class="text-center z-10">
               <Icon name="heroicons:map" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
               <p class="text-gray-500 font-medium">Interactive Heatmap</p>
               <p class="text-xs text-gray-400 mt-1">Found {{ hotspots.length }} high-density clusters</p>
             </div>
             <!-- In real app, mount Leaflet map here -->
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Fetch Dashboard Data
const { data: metrics } = await useAuthFetch('/dashboard/metrics')
const { data: predictionsData } = await useAuthFetch('/predictions/failure-risk')
const { data: hotspotsData } = await useAuthFetch('/hotspots')

const stats = computed(() => [
  { label: 'Total Reports', value: metrics.value?.totalReports || 120, trend: 12, icon: 'heroicons:document-text', textClass: 'text-primary-600' },
  { label: 'Resolved', value: metrics.value?.resolvedCount || 85, trend: 8, icon: 'heroicons:check-circle', textClass: 'text-green-600' },
  { label: 'Pending', value: metrics.value?.pendingCount || 35, trend: -5, icon: 'heroicons:clock', textClass: 'text-yellow-600' },
  { label: 'Avg Resolution', value: `${metrics.value?.avgResolutionTime || 2.4} days`, trend: 0, icon: 'heroicons:bolt', textClass: 'text-blue-600' },
])

const predictions = computed(() => predictionsData.value?.predictions || [])
const hotspots = computed(() => hotspotsData.value?.clusters || hotspotsData.value || [])

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'CRITICAL': return 'bg-red-100 text-red-800'
    case 'HIGH': return 'bg-orange-100 text-orange-800'
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-green-100 text-green-800'
  }
}
</script>
