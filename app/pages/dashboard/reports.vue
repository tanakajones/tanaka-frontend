<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const config = useRuntimeConfig()
const { data: reportsData } = await useAuthFetch('/issues/my-reports')

const reports = computed(() => {
  if (!reportsData.value) return []
  return (reportsData.value as any).content || reportsData.value || []
})

const getImageUrl = (path: string) => {
   if (!path) return ''
   if (path.startsWith('http')) return path
   const baseUrl = config.public.apiBase.replace('/api', '')
   const cleanPath = path.startsWith('/') ? path : `/${path}`
   return `${baseUrl}${cleanPath}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-100 text-amber-800'
    case 'RESOLVED': return 'bg-green-100 text-green-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    default: return 'bg-blue-100 text-blue-800'
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-100 text-red-800'
    case 'HIGH': return 'bg-orange-100 text-orange-800'
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-blue-100 text-blue-800'
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Filters / Toolbar -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
      <div class="relative w-full sm:w-64">
        <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input type="text" placeholder="Search reports..." 
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm">
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <div class="flex items-center gap-2 text-xs text-gray-400 font-medium">
           {{ reports.length }} reports found
        </div>
      </div>
    </div>

    <!-- Reports Grid/List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
      <div class="flex-1 overflow-y-auto min-h-0">
        <div v-if="reports.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <div v-for="report in reports" :key="report.id" class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white flex flex-col group">
            <div class="h-44 bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
               <img :src="getImageUrl(report.imagePath)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
               <span class="absolute top-2 right-2 px-2.5 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-gray-700 shadow-sm border border-gray-100">
                 {{ new Date(report.reportedAt || Date.now()).toLocaleDateString() }}
               </span>
               <div v-if="report.confidence" class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur text-white text-[9px] font-bold rounded uppercase tracking-wider">
                  AI: {{ (report.confidence * 100).toFixed(0) }}% cert
               </div>
            </div>
            <div class="flex justify-between items-start mb-2 gap-2">
              <h3 class="font-bold text-gray-900 line-clamp-1 flex-1">{{ report.title }}</h3>
              <span :class="getStatusColor(report.status)" class="flex-shrink-0 px-2.5 py-1 text-[10px] rounded-full font-bold uppercase tracking-wider border border-current opacity-90">{{ report.status }}</span>
            </div>
            <p class="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
              {{ report.description }}
            </p>
            <div class="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center text-[10px]">
               <div class="flex flex-col">
                  <span class="text-gray-400 font-mono uppercase">#{{ report.id.substring(0, 8) }}</span>
                  <span :class="getSeverityColor(report.severity)" class="font-bold mt-1">{{ report.category }} • {{ report.severity }}</span>
               </div>
               <button class="text-primary-600 hover:text-primary-700 font-bold uppercase tracking-wide px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-100">View &rarr;</button>
            </div>
          </div>
        </div>
        <div v-else class="h-full flex flex-col items-center justify-center p-12 text-center">
           <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <Icon name="heroicons:bolt-slash" class="w-10 h-10 text-gray-300" />
           </div>
           <h3 class="font-bold text-gray-900">No reports found</h3>
           <p class="text-sm text-gray-500 max-w-xs mt-2">You haven't submitted any infrastructure issues yet. Start by reporting your first issue!</p>
           <NuxtLink to="/dashboard/report" class="mt-6 px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">Report Issue</NuxtLink>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="reports.length > 0" class="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
         <span class="text-sm text-gray-500 font-medium">Results for your account</span>
         <div class="flex gap-2 text-xs font-bold text-gray-400">
            PAGE 1
         </div>
      </div>
    </div>
  </div>
</template>
