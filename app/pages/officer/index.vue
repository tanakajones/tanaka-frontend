<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="relative overflow-hidden bg-gradient-to-r from-primary-600 to-emerald-700 rounded-2xl p-8 text-white shadow-xl">
      <div class="relative z-10">
        <h2 class="text-3xl font-bold mb-2">Welcome back, {{ authStore.user?.firstname || 'Officer' }}!</h2>
        <p class="text-emerald-100 max-w-md">You have {{ activeJobs.length }} active assignments today. Keep up the great work in making our city better!</p>
      </div>
      <Icon name="heroicons:sparkles" class="absolute right-[-20px] top-[-20px] w-64 h-64 text-white/10 rotate-12" />
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Icon name="heroicons:clipboard-document-list" class="w-6 h-6" />
          </div>
          <span class="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Active</span>
        </div>
        <h3 class="text-3xl font-black text-gray-900">{{ activeJobs.length }}</h3>
        <p class="text-sm text-gray-500 font-medium">Allocated Jobs</p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-green-50 rounded-xl text-green-600">
            <Icon name="heroicons:check-circle" class="w-6 h-6" />
          </div>
          <span class="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">Done</span>
        </div>
        <h3 class="text-3xl font-black text-gray-900">{{ completedCount }}</h3>
        <p class="text-sm text-gray-500 font-medium">Completed This Week</p>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Icon name="heroicons:clock" class="w-6 h-6" />
          </div>
          <span class="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">Pending</span>
        </div>
        <h3 class="text-3xl font-black text-gray-900">{{ overdueCount }}</h3>
        <p class="text-sm text-gray-500 font-medium">Overdue Tasks</p>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Assignments -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-bold text-gray-800 flex items-center">
            <Icon name="heroicons:list-bullet" class="w-5 h-5 mr-2 text-primary-600" />
            Priority Assignments
          </h3>
          <NuxtLink to="/officer/jobs" class="text-sm font-bold text-primary-600 hover:text-primary-700">View All</NuxtLink>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="job in activeJobs.slice(0, 5)" :key="job.id" class="p-6 hover:bg-gray-50 transition-colors group">
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{{ job.description }}</h4>
              <span :class="getPriorityClass(job.priority)" class="text-[10px] font-black uppercase px-2 py-1 rounded-lg">
                {{ job.priority }}
              </span>
            </div>
            <div class="flex items-center text-xs text-gray-500 gap-4">
              <span class="flex items-center gap-1">
                <Icon name="heroicons:map-pin" class="w-4 h-4 text-gray-400" />
                {{ job.ward }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="heroicons:calendar" class="w-4 h-4 text-gray-400" />
                Due: {{ formatDate(job.deadline) }}
              </span>
            </div>
          </div>
          <div v-if="!activeJobs.length" class="p-12 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Icon name="heroicons:clipboard" class="w-8 h-8 text-gray-300" />
            </div>
            <p class="text-gray-500 font-medium">No active jobs assigned to you.</p>
          </div>
        </div>
      </div>

      <!-- Quick Map View -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[500px] flex flex-col">
        <div class="p-6 border-b border-gray-50 bg-gray-50/50">
          <h3 class="font-bold text-gray-800 flex items-center">
            <Icon name="heroicons:map" class="w-5 h-5 mr-2 text-primary-600" />
            Job Locations
          </h3>
        </div>
        <div class="flex-1 bg-gray-100 relative">
          <ClientOnly>
            <div id="overview-map" class="w-full h-full"></div>
          </ClientOnly>
          <div v-if="!activeJobs.length" class="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-10">
            <p class="text-gray-400 font-bold italic">Map will display your allocated jobs</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'officer',
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const activeJobs = ref<any[]>([])
const completedCount = ref(0)
const overdueCount = ref(0)
let L: any = null
let map: any = null

onMounted(async () => {
  fetchDashboardData()
  
  if (process.client) {
    L = await import('leaflet')
    import('leaflet/dist/leaflet.css')
    initMap()
  }
})

const fetchDashboardData = async () => {
  try {
    const officerId = authStore.user?.officerId
    if (!officerId) return

    const [active, completed] = await Promise.all([
      $fetch(`${config.public.apiBase}/tasks/officer/${officerId}`, {
        query: { type: 'active' },
        headers: { Authorization: `Bearer ${authStore.token}` }
      }),
      $fetch(`${config.public.apiBase}/tasks/officer/${officerId}`, {
        query: { type: 'completed' },
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    ])

    activeJobs.value = (active as any[]) || []
    completedCount.value = (completed as any[]).length
    
    // Calculate overdue (mock logic if not from API)
    overdueCount.value = activeJobs.value.filter(j => new Date(j.deadline) < new Date()).length
    
    if (activeJobs.value.length > 0) {
      plotMarkers()
    }
  } catch (e) {
    console.error('Failed to fetch dashboard data', e)
  }
}

const initMap = () => {
  setTimeout(() => {
    if (!document.getElementById('overview-map')) return
    
    map = L.map('overview-map').setView([-17.82, 31.05], 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)
    
    plotMarkers()
  }, 500)
}

const plotMarkers = () => {
  if (!map || !L || !activeJobs.value.length) return
  
  activeJobs.value.forEach(job => {
    if (job.location) {
      L.marker([job.location.y, job.location.x])
        .bindPopup(`<b>\${job.description}</b>`)
        .addTo(map)
    }
  })
}

const getPriorityClass = (priority: string) => {
  switch(priority) {
    case 'CRITICAL': return 'bg-red-100 text-red-700 border border-red-200'
    case 'HIGH': return 'bg-orange-100 text-orange-700 border border-orange-200'
    case 'MEDIUM': return 'bg-blue-100 text-blue-700 border border-blue-200'
    default: return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
</script>
