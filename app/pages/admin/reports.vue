<template>
  <div class="space-y-6 pb-12">
    <!-- Simplified Header -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Infrastructure Statistics</h2>
        <p class="text-gray-500 text-sm">Summary of categories with active reports.</p>
      </div>
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="relative flex-1 md:w-64">
          <Icon name="heroicons:funnel" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select v-model="selectedCategory" class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none">
            <option value="all">All Active Categories</option>
            <option v-for="(count, cat) in activeCategories" :key="cat" :value="cat">
              {{ cat.replace('_', ' ') }} ({{ count }})
            </option>
          </select>
        </div>
        <button @click="downloadCSV" class="p-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm" title="Export CSV">
          <Icon name="heroicons:table-cells" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Active Issues</p>
        <p class="text-4xl font-black text-gray-900 mt-2">{{ totalIssues }}</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Resolution Rate</p>
        <p class="text-4xl font-black text-primary-600 mt-2">{{ reports?.resolutionRate?.toFixed(1) || 0 }}%</p>
      </div>
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Response</p>
        <div class="flex items-baseline gap-1 mt-2">
          <p class="text-4xl font-black text-orange-500">{{ reports?.avgResponseTime?.toFixed(1) || 0 }}</p>
          <p class="text-sm font-bold text-gray-400">hrs</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Category Volume List -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Icon name="heroicons:chart-bar" class="w-5 h-5 text-primary-500" />
          Active Category Breakdown
        </h3>
        <div class="space-y-4">
          <div v-for="(count, cat) in filteredCategories" :key="cat" class="group">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-bold text-gray-700">{{ cat.replace('_', ' ') }}</span>
              <span class="font-bold text-gray-900">{{ count }} reports</span>
            </div>
            <div class="w-full bg-gray-50 rounded-full h-2 overflow-hidden">
              <div 
                class="bg-primary-500 h-full rounded-full transition-all duration-700" 
                :style="{ width: (count / totalIssues * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div v-if="Object.keys(filteredCategories).length === 0" class="py-12 text-center text-gray-400 font-medium">
             No active issues found for this selection.
          </div>
        </div>
      </div>

      <!-- Ward Impact -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Icon name="heroicons:map-pin" class="w-5 h-5 text-orange-500" />
          Impacted Areas
        </h3>
        <div class="flex items-end justify-between h-48 gap-2 px-4">
          <div v-for="(count, ward) in reports?.byWard" :key="ward" class="flex-1 flex flex-col items-center group">
            <div class="w-full bg-orange-100 rounded-t-lg relative transition-all" :style="{ height: (count / maxWardCount * 100) + '%' }">
              <div class="w-full h-full bg-orange-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span class="text-[10px] font-bold text-gray-400 mt-2 rotate-45 truncate w-8">{{ ward }}</span>
          </div>
        </div>
      </div>
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
          <tr v-for="(count, cat) in filteredCategories" :key="cat" class="hover:bg-gray-50/50 transition-all">
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const config = useRuntimeConfig()
const { data: reports } = await useAuthFetch('/reports/summary')

const selectedCategory = ref('all')

// Only show categories that have at least one report
const activeCategories = computed(() => {
  if (!reports.value?.byCategory) return {}
  return Object.fromEntries(
    Object.entries(reports.value.byCategory)
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
  if (!reports.value?.byWard) return 1
  const values: any = Object.values(reports.value.byWard)
  return values.length > 0 ? Math.max(...values) : 1
})

const downloadCSV = () => {
  const url = `${config.public.apiBase}/reports/export/csv`
  window.open(url, '_blank')
}

const getDotColor = (cat: string) => {
  const c = cat.toUpperCase()
  if (c.includes('ROAD')) return 'bg-blue-500'
  if (c.includes('WASTE')) return 'bg-green-500'
  if (c.includes('DRAIN')) return 'bg-orange-500'
  return 'bg-purple-500'
}
</script>
