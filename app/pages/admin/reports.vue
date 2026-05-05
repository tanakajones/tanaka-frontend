<template>
  <div class="space-y-6 pb-12">
    <!-- Loading State -->
    <div v-if="!reports" class="h-[600px] flex flex-col items-center justify-center text-gray-400">
       <Icon name="heroicons:chart-pie" class="w-16 h-16 animate-pulse mb-4 text-gray-200" />
       <p class="font-bold animate-pulse text-lg">Analyzing infrastructure data...</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Infrastructure Analytics</h2>
          <p class="text-gray-500 text-sm">Comprehensive performance and volume tracking.</p>
        </div>
        <div class="flex items-center gap-2">
           <button @click="downloadExcel" class="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-xs flex items-center gap-2 shadow-sm">
              <Icon name="heroicons:table-cells" class="w-4 h-4" />
              Export Excel
           </button>
           <button @click="downloadCSV" class="p-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm" title="Export CSV">
              <Icon name="heroicons:document-text" class="w-5 h-5" />
           </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Reports</p>
          <p class="text-3xl font-black text-gray-900 mt-2">{{ (reports as any).totalReports }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolution Rate</p>
          <p class="text-3xl font-black text-emerald-600 mt-2">{{ (reports as any).resolutionRate?.toFixed(1) }}%</p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Response</p>
          <p class="text-3xl font-black text-orange-500 mt-2">{{ (reports as any).avgResponseTime?.toFixed(1) }} <span class="text-xs">hrs</span></p>
        </div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency Score</p>
          <p class="text-3xl font-black text-indigo-600 mt-2">{{ (reports as any).efficiencyScore }}/100</p>
        </div>
      </div>

      <!-- Main Charts Row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
           <TrendBarChart :data="(reports as any).monthlyTrend || {}" />
        </div>
        <div class="lg:col-span-1">
           <DistributionPie 
             title="Status Distribution" 
             icon="heroicons:check-badge" 
             iconColor="text-emerald-500" 
             :data="(reports as any).byStatus || {}" 
             :colors="['#f59e0b', '#3b82f6', '#10b981', '#ef4444']"
           />
        </div>
      </div>

      <!-- Main Charts Row 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Category Volume -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Icon name="heroicons:chart-bar" class="w-5 h-5 text-primary-500" />
            Issue Volume by Category
          </h3>
          <div class="space-y-4">
            <div v-for="(count, cat) in (reports as any).byCategory" :key="cat" class="group">
              <div class="flex justify-between text-sm mb-1">
                <span class="font-bold text-gray-700 uppercase text-[10px] tracking-wider">{{ cat.replace('_', ' ') }}</span>
                <span class="font-bold text-gray-900">{{ count }}</span>
              </div>
              <div class="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                <div 
                  class="bg-primary-500 h-full rounded-full transition-all duration-700" 
                  :style="{ width: (count / ((reports as any).totalReports || 1) * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Severity Analysis -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Icon name="heroicons:fire" class="w-5 h-5 text-red-500" />
            Severity Breakdown
          </h3>
          <div class="flex items-end h-40 gap-4 mt-8">
             <div v-for="(count, sev) in (reports as any).bySeverity" :key="sev" class="flex-1 flex flex-col items-center group">
                <div class="w-full bg-gray-100 rounded-t-xl relative overflow-hidden flex flex-col justify-end h-full">
                   <div 
                     class="w-full transition-all duration-1000" 
                     :class="getSeverityColor(sev)"
                     :style="{ height: (count / ((reports as any).totalReports || 1) * 100) + '%' }"
                   ></div>
                </div>
                <span class="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-tighter">{{ sev }}</span>
                <span class="text-xs font-bold text-gray-700">{{ count }}</span>
             </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Ward Impact -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Icon name="heroicons:map-pin" class="w-5 h-5 text-orange-500" />
            Ward Impact Map
          </h3>
          <div class="flex items-end justify-between h-40 gap-2 px-4 mt-8">
            <div v-for="(count, ward) in (reports as any).byWard" :key="ward" class="flex-1 flex flex-col items-center group">
              <div class="w-full bg-orange-50 rounded-t-lg relative h-full flex flex-col justify-end">
                <div class="w-full bg-orange-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all" :style="{ height: (count / (maxWardCount || 1) * 100) + '%' }"></div>
              </div>
              <span class="text-[8px] font-bold text-gray-400 mt-2 truncate w-8 text-center">{{ ward }}</span>
            </div>
            <div v-if="!(reports as any).byWard || Object.keys((reports as any).byWard).length === 0" class="w-full h-full flex items-center justify-center text-gray-300 text-xs italic">
               No location data available
            </div>
          </div>
        </div>

        <WorkloadChart :officers="officers" />
      </div>

      <!-- Simple Data Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th class="px-6 py-4">Category</th>
              <th class="px-6 py-4">Total Reports</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-sm font-bold">
            <tr v-for="(count, cat) in activeCategories" :key="cat" class="hover:bg-gray-50/50 transition-all">
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="getDotColor(cat)"></span>
                  {{ cat.replace('_', ' ') }}
                </div>
              </td>
              <td class="px-6 py-4 text-gray-900">{{ count }}</td>
              <td class="px-6 py-4">
                <span class="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-widest">
                  {{ count > 5 ? 'High Volume' : 'Stable' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const { data: reports } = await useAuthFetch('/reports/summary')
const { data: officersData } = await useAuthFetch('/officers')

const officers = computed(() => (officersData.value as any[]) || [])
const selectedCategory = ref('all')

const activeCategories = computed(() => {
  if (!(reports.value as any)?.byCategory) return {}
  return Object.fromEntries(
    Object.entries((reports.value as any).byCategory)
      .filter(([, count]: any) => count > 0)
      .sort(([, a]: any, [, b]: any) => b - a)
  )
})

const filteredCategories = computed(() => {
  if (selectedCategory.value === 'all') return activeCategories.value
  return { [selectedCategory.value]: activeCategories.value[selectedCategory.value] }
})

const totalIssues = computed(() => {
  return Object.values(activeCategories.value).reduce((a: any, b: any) => a + b, 0)
})

const maxWardCount = computed(() => {
  if (!(reports.value as any)?.byWard) return 1
  const values: any = Object.values((reports.value as any).byWard)
  return values.length > 0 ? Math.max(...values) : 1
})

const downloadFile = async (url: string, filename: string) => {
   try {
      const response = await fetch(url, {
         headers: { Authorization: `Bearer ${authStore.token}` }
      })
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(link.href)
   } catch (e) {
      alert('Failed to download report. Please try again.')
      console.error(e)
   }
}

const downloadCSV = () => {
  downloadFile(`${config.public.apiBase}/reports/export/csv`, `tanaka_report_${Date.now()}.csv`)
}

const downloadExcel = () => {
  downloadFile(`${config.public.apiBase}/reports/export/excel`, `tanaka_full_report.csv`)
}

const getSeverityColor = (sev: string) => {
   switch(sev.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-blue-500'
      default: return 'bg-gray-400'
   }
}

const getDotColor = (cat: string) => {
  const c = cat.toUpperCase()
  if (c.includes('ROAD')) return 'bg-blue-500'
  if (c.includes('WASTE')) return 'bg-green-500'
  if (c.includes('DRAIN')) return 'bg-orange-500'
  return 'bg-purple-500'
}
</script>
