<template>
  <div>
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500">Total Reports</p>
          <p class="text-3xl font-bold text-gray-900 mt-1">{{ totalReports }}</p>
        </div>
        <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Icon name="heroicons:document-duplicate" class="w-6 h-6" />
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500">Pending</p>
          <p class="text-3xl font-bold text-gray-900 mt-1">{{ pendingCount }}</p>
        </div>
        <div class="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
          <Icon name="heroicons:clock" class="w-6 h-6" />
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500">Resolved</p>
          <p class="text-3xl font-bold text-gray-900 mt-1">{{ resolvedCount }}</p>
        </div>
        <div class="p-3 bg-green-50 text-green-600 rounded-xl">
          <Icon name="heroicons:check-circle" class="w-6 h-6" />
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md transition-all group" @click="router.push('/dashboard/report')">
        <div>
          <p class="text-sm font-medium text-primary-600">Action</p>
          <p class="text-lg font-bold text-gray-900 mt-1 group-hover:text-primary-700 transition-colors">+ New Report</p>
        </div>
        <div class="p-3 bg-primary-50 text-primary-600 rounded-xl">
          <Icon name="heroicons:plus" class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Recent Uploads Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <h3 class="text-lg font-bold text-gray-900">Recent Uploads</h3>
        <NuxtLink to="/dashboard/reports" class="text-primary-600 hover:text-primary-700 text-sm font-medium">View All &rarr;</NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600 border-collapse">
          <thead class="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-tighter text-[10px]">
            <tr>
              <th class="px-6 py-4">Image</th>
              <th class="px-6 py-4">Report ID</th>
              <th class="px-6 py-4">Issue Title</th>
              <th class="px-6 py-4">Category / Severity</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="report in recentReports" :key="report.id" class="hover:bg-gray-50 transition-colors group">
              <td class="px-6 py-4">
                <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-sm group-hover:scale-105 transition-transform">
                   <img :src="getImageUrl(report.imagePath)" class="w-full h-full object-cover">
                </div>
              </td>
              <td class="px-6 py-4 font-mono text-[10px] text-gray-400 group-hover:text-gray-600 transition-colors uppercase">#{{ report.id.substring(0, 10) }}</td>
              <td class="px-6 py-4 font-bold text-gray-900 truncate max-w-[200px]">{{ report.title }}</td>
              <td class="px-6 py-4">
                <div class="flex flex-col gap-1">
                   <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-600 w-fit border border-gray-200">{{ report.category }}</span>
                   <span :class="getSeverityColor(report.severity)" class="font-bold text-[9px] uppercase tracking-wider">{{ report.severity }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-xs font-medium">{{ new Date(report.reportedAt || Date.now()).toLocaleDateString() }}</td>
              <td class="px-6 py-4">
                <span :class="getStatusColor(report.status)" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border border-current">
                   {{ report.status }}
                </span>
              </td>
            </tr>
            <tr v-if="reports.length === 0">
               <td colspan="6" class="px-6 py-12 text-center text-gray-400 italic">No reports found. Start by capturing an issue!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()
const { data: reportsData, error: fetchError } = await useAuthFetch('/issues/my-reports')

if (fetchError.value) {
    console.error('Failed to fetch reports:', fetchError.value)
}

const reports = computed(() => {
  if (!reportsData.value) return []
  return (reportsData.value as any).content || reportsData.value || []
})

const totalReports = computed(() => reports.value.length)
const pendingCount = computed(() => reports.value.filter((r: any) => r.status === 'PENDING').length)
const resolvedCount = computed(() => reports.value.filter((r: any) => r.status === 'RESOLVED').length)
const recentReports = computed(() => reports.value.slice(0, 5))

const getImageUrl = (path: string) => {
   if (!path) return ''
   if (path.startsWith('http')) return path
   return `${config.public.apiBase.replace('/api', '')}${path}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'text-amber-600 bg-amber-50'
    case 'RESOLVED': return 'text-green-600 bg-green-50'
    case 'REJECTED': return 'text-red-600 bg-red-50'
    default: return 'text-blue-600 bg-blue-50'
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'text-red-500'
    case 'HIGH': return 'text-orange-500'
    case 'MEDIUM': return 'text-yellow-500'
    default: return 'text-blue-500'
  }
}
</script>
