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
        <div class="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
          <div v-for="job in activeJobs" :key="job.id" class="p-6 hover:bg-gray-50 transition-colors group">
            <div class="flex justify-between items-start mb-2">
              <div>
                 <h4 class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{{ job.title || job.description }}</h4>
                 <p class="text-[10px] text-gray-400 font-medium">Task ID: {{ job.taskId }}</p>
              </div>
              <span :class="getPriorityClass(job.severity || job.priority)" class="text-[10px] font-black uppercase px-2 py-1 rounded-lg">
                {{ job.severity || job.priority }}
              </span>
            </div>
            
            <div class="flex items-center text-xs text-gray-500 gap-4 mb-4">
              <span class="flex items-center gap-1">
                <Icon name="heroicons:map-pin" class="w-4 h-4 text-gray-400" />
                {{ job.wardId || job.ward || 'N/A' }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="heroicons:tag" class="w-4 h-4 text-gray-400" />
                {{ job.category }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-3">
               <div class="flex items-center gap-2">
                  <button 
                    @click="updateJobStatus(job, 'IN_PROGRESS')" 
                    v-if="job.status === 'PENDING'"
                    class="flex-1 py-2 bg-primary-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-primary-700 transition-all shadow-sm">
                    Start Job
                  </button>
                  <button 
                    @click="updateJobStatus(job, 'RESOLVED')" 
                    class="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm">
                    Complete Job
                  </button>
               </div>
               
               <div class="relative group/comment">
                  <input 
                    v-model="job.newComment"
                    @keyup.enter="addComment(job)"
                    placeholder="Add a progress update..." 
                    class="w-full pl-3 pr-10 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all">
                  <button @click="addComment(job)" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                     <Icon name="heroicons:paper-airplane" class="w-4 h-4" />
                  </button>
               </div>
               
               <div v-if="job.notes" class="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  <p class="text-[10px] font-bold text-blue-600 uppercase mb-1">Latest Update</p>
                  <p class="text-[11px] text-gray-600 italic">"{{ job.notes }}"</p>
               </div>
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
    let officerId = authStore.user?.officerId
    
    // If officerId is missing, try to find it by email
    if (!officerId && authStore.user?.email) {
      const officers = await $fetch(`${config.public.apiBase}/officers`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      const me = (officers as any[]).find(o => o.email === authStore.user.email)
      if (me) {
        officerId = me.id
        authStore.user.officerId = me.id // Update store locally
      }
    }

    if (!officerId) return

    const [tasksData, completedData] = await Promise.all([
      $fetch(`${config.public.apiBase}/tasks/officer/${officerId}`, {
        query: { type: 'active' },
        headers: { Authorization: `Bearer ${authStore.token}` }
      }),
      $fetch(`${config.public.apiBase}/tasks/officer/${officerId}`, {
        query: { type: 'completed' },
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
    ])

    const tasks = (tasksData as any[]) || []
    completedCount.value = (completedData as any[]).length
    
    if (tasks.length > 0) {
      // Enrich with issue data
      const enriched = await Promise.all(tasks.map(async (task: any) => {
        try {
          const issue = await $fetch(`${config.public.apiBase}/issues/${task.issueId}`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
          return { ...task, ...issue, taskId: task.id }
        } catch (e) {
          return task
        }
      }))
      
      // Sort by routeOrder
      activeJobs.value = enriched.sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0))
      
      // Calculate overdue
      overdueCount.value = activeJobs.value.filter(j => j.deadline && new Date(j.deadline) < new Date()).length
      
      // Draw route on map
      drawRoute()
    } else {
      activeJobs.value = []
    }
  } catch (e) {
    console.error('Failed to fetch dashboard data', e)
  }
}

const initMap = () => {
  setTimeout(() => {
    if (!document.getElementById('overview-map')) return
    
    // Fix icons
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
       iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
       iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
       shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    map = L.map('overview-map', { zoomControl: false }).setView([-17.8465, 31.0069], 12)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)
    
    // Add HQ Marker
    const homeIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color:#059669; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 8px;'>HQ</div>",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    L.marker([HQ_LOCATION.lat, HQ_LOCATION.lng], { icon: homeIcon }).addTo(map)
    
    if (activeJobs.value.length > 0) {
      drawRoute()
    }
  }, 500)
}

const fetchOSRMRoute = async (coordinates: [number, number][]) => {
   if (!coordinates || coordinates.length < 2) return coordinates;
   const coordsString = coordinates.map(c => `${c[1]},${c[0]}`).join(';')
   const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
   
   try {
      const response = await fetch(url)
      const data = await response.json()
      if (data.code === 'Ok' && data.routes?.[0]) {
         return data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
      }
   } catch (e) {}
   return coordinates
}

const updateJobStatus = async (job: any, status: string) => {
   try {
      await $fetch(`${config.public.apiBase}/tasks/${job.taskId}/status`, {
         method: 'PUT',
         headers: { Authorization: `Bearer ${authStore.token}` },
         body: { status }
      })
      await fetchDashboardData()
   } catch (e) {
      console.error('Failed to update status', e)
   }
}

const addComment = async (job: any) => {
   if (!job.newComment?.trim()) return
   try {
      await $fetch(`${config.public.apiBase}/tasks/${job.taskId}/notes`, {
         method: 'PUT',
         headers: { Authorization: `Bearer ${authStore.token}` },
         body: { notes: job.newComment }
      })
      job.notes = job.newComment
      job.newComment = ''
      // await fetchDashboardData()
   } catch (e) {
      console.error('Failed to add comment', e)
   }
}

const drawRoute = async () => {
  if (!map || !L || !activeJobs.value.length) return
  
  // Clear previous markers/lines if any
  map.eachLayer((layer: any) => {
    if (layer instanceof L.Marker && layer.getPopup()?.getContent()?.includes('HQ') === false) {
      map.removeLayer(layer)
    }
    if (layer instanceof L.Polyline) {
      map.removeLayer(layer)
    }
  })

  const coords: [number, number][] = [[HQ_LOCATION.lat, HQ_LOCATION.lng]]
  
  activeJobs.value.forEach(job => {
    if (job.location) {
      const lat = job.location.y
      const lng = job.location.x
      coords.push([lat, lng])
      
      L.marker([lat, lng])
        .bindPopup(`<b>${job.title || job.description}</b><br>Priority: ${job.priority}`)
        .addTo(map)
    }
  })
  
  coords.push([HQ_LOCATION.lat, HQ_LOCATION.lng]) // Return trip

  const streetPoints = await fetchOSRMRoute(coords)
  const polyline = L.polyline(streetPoints, { 
    color: '#10b981', 
    weight: 5, 
    opacity: 0.7,
    lineJoin: 'round'
  }).addTo(map)
  
  map.fitBounds(polyline.getBounds().pad(0.2))
}

const getPriorityClass = (priority: string) => {
  switch(priority) {
    case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200'
    case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'MEDIUM': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
</script>
