<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Data-Driven Analytics Report</h2>
        <p class="text-gray-500 mt-1">Comprehensive summary of city infrastructure issues and remediation status.</p>
      </div>
      <div class="flex gap-4">
        <button @click="downloadCSV" class="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-sm">
          <Icon name="heroicons:table-cells" class="w-5 h-5" />
          Download CSV
        </button>
        <button class="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30">
          <Icon name="heroicons:document-arrow-down" class="w-5 h-5" />
          Generate PDF Report
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="(val, label) in reports?.byStatus" :key="label" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-primary-200 transition-all">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ label.replace('_', ' ') }}</p>
        <p class="text-4xl font-black text-gray-900 mt-2">{{ val }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Pie Chart: Categories -->
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-[500px]">
        <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
           <Icon name="heroicons:chart-pie" class="w-6 h-6 text-primary-500" />
           Issue Distribution by Category
        </h3>
        <div class="relative h-[350px] flex items-center justify-center">
            <!-- Simple custom pie-like visual if chart.js is still installing -->
            <div class="flex flex-col gap-4 w-full">
               <div v-for="(count, cat) in sortedCategories" :key="cat" class="space-y-2">
                  <div class="flex justify-between text-sm font-bold">
                     <span class="text-gray-700">{{ cat.replace('_', ' ') }}</span>
                     <span class="text-gray-400">{{ count }} issues ({{ ((count / totalIssues) * 100).toFixed(1) }}%)</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                     <div class="bg-primary-500 h-full rounded-full transition-all duration-1000" :style="{ width: (count / totalIssues * 100) + '%' }"></div>
                  </div>
               </div>
            </div>
        </div>
      </div>

      <!-- Bar Chart: Location/Ward -->
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-[500px]">
        <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
           <Icon name="heroicons:map-pin" class="w-6 h-6 text-orange-500" />
           Report Frequency by Ward (Location)
        </h3>
        <div class="flex items-end justify-between h-[350px] pt-10 gap-4">
           <div v-for="(count, ward) in reports?.byWard" :key="ward" class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full bg-orange-100 rounded-t-lg relative group transition-all" :style="{ height: (count / maxWardCount * 100) + '%' }">
                 <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {{ count }}
                 </div>
                 <div class="w-full h-full bg-orange-500 rounded-t-lg scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom"></div>
              </div>
              <span class="text-[10px] font-bold text-gray-400 rotate-45 mt-4">{{ ward }}</span>
           </div>
        </div>
      </div>
    </div>

    <!-- Report Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900">Infrastructure Health Summary</h3>
          <span class="text-sm font-bold text-gray-400 uppercase">Last updated: Just now</span>
      </div>
      <table class="w-full text-left">
        <thead class="bg-gray-50 text-gray-600 text-sm font-bold">
          <tr>
            <th class="p-5 border-b">Category</th>
            <th class="p-5 border-b">Density Score</th>
            <th class="p-5 border-b">Total Reports</th>
            <th class="p-5 border-b">Resolution Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 text-base font-medium">
          <tr v-for="(count, cat) in reports?.byCategory" :key="cat" class="hover:bg-gray-50 transition-colors">
            <td class="p-5">
               <span class="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-bold border border-primary-100">
                  {{ cat.replace('_', ' ') }}
               </span>
            </td>
            <td class="p-5">
               <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden w-24">
                     <div class="bg-red-500 h-full" :style="{ width: (Math.min(count * 5, 100)) + '%' }"></div>
                  </div>
                  <span class="text-xs font-bold text-gray-400 text-right">{{ Math.min(count * 5, 100) }}%</span>
               </div>
            </td>
            <td class="p-5 text-gray-900 font-bold">{{ count }}</td>
            <td class="p-5">
               <span class="flex items-center gap-2 text-green-600 font-bold text-sm">
                  <Icon name="heroicons:shield-check" class="w-5 h-5" />
                  Healthy
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
const authStore = useAuthStore()
const { data: reports } = await useAuthFetch('/reports/summary')

const totalIssues = computed(() => {
   if (!reports.value?.byCategory) return 0
   return Object.values(reports.value.byCategory).reduce((a: any, b: any) => a + b, 0)
})

const sortedCategories = computed(() => {
   if (!reports.value?.byCategory) return {}
   return Object.fromEntries(
     Object.entries(reports.value.byCategory).sort(([,a]: any, [,b]: any) => b - a)
   )
})

const maxWardCount = computed(() => {
   if (!reports.value?.byWard) return 1
   return Math.max(...Object.values(reports.value.byWard).map((v: any) => v))
})

const downloadCSV = () => {
   const url = `${config.public.apiBase}/reports/export/csv`
   window.open(url, '_blank')
}
</script>
