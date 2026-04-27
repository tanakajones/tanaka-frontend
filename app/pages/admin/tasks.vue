<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center z-20 relative">
       <div>
          <h2 class="text-xl font-bold text-gray-800 tracking-tight">AI Resource Optimization</h2>
          <p class="text-xs text-gray-500 font-medium">Auto-allocate tasks based on proximity, skills, and priority</p>
       </div>
       <div class="flex gap-3">
          <button @click="fetchPendingTasks" class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
             <Icon name="heroicons:arrow-path" class="w-5 h-5" :class="loading ? 'animate-spin' : ''" />
          </button>
          <button @click="optimizeRoutes" :disabled="optimizing || !pendingTasks.length" class="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:shadow-primary-500/30 font-black text-sm uppercase tracking-wider flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed">
             <Icon name="heroicons:cpu-chip" class="w-5 h-5 mr-2" :class="optimizing ? 'animate-spin' : ''" />
             {{ optimizing ? 'Optimizing...' : 'Run Optimization' }}
          </button>
       </div>
    </div>

    <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 relative">
       <!-- Side Panel: Pending & Results -->
       <div class="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden z-10 relative h-full">
          <!-- Pending Tasks -->
          <div class="flex-1 flex flex-col min-h-0">
             <div class="p-4 border-b border-gray-100 bg-gray-50/50 font-black text-[10px] uppercase tracking-widest text-gray-400 flex justify-between items-center">
                <span>Pending Issues</span>
                <span class="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">{{ pendingTasks.length }}</span>
             </div>
             <div class="flex-1 overflow-y-auto p-3 space-y-3">
                <div v-for="task in pendingTasks" :key="task.id" 
                     @click="flyToTask(task)"
                     class="p-4 bg-white border border-gray-100 rounded-xl hover:border-primary-300 transition-all cursor-pointer group shadow-sm hover:shadow-md relative overflow-hidden">
                   <div :class="getPriorityBar(task.priority)" class="absolute left-0 top-0 bottom-0 w-1"></div>
                   <div class="flex justify-between items-start mb-2">
                      <h4 class="font-bold text-gray-800 text-xs leading-tight group-hover:text-primary-600">{{ task.description }}</h4>
                   </div>
                   <div class="flex items-center justify-between mt-3">
                      <span :class="getPriorityColor(task.priority)" class="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border">
                        {{ task.priority }}
                      </span>
                      <span class="text-[10px] font-mono text-gray-400">#{{ task.id.substring(0,6) }}</span>
                   </div>
                </div>
                <div v-if="!pendingTasks.length && !loading" class="text-center py-12">
                   <Icon name="heroicons:check-circle" class="w-12 h-12 text-green-200 mx-auto mb-2" />
                   <p class="text-xs text-gray-400 font-bold">All issues currently allocated</p>
                </div>
             </div>
          </div>
          
          <!-- Optimization Results Summary -->
          <transition name="slide-up">
            <div v-if="optimizedData" class="border-t border-primary-100 bg-primary-50/30 flex flex-col max-h-[60%] shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
               <div class="p-4 border-b border-primary-100 flex justify-between items-center bg-white/50">
                 <h4 class="font-black text-[10px] text-primary-800 uppercase tracking-widest">Allocation Summary</h4>
                 <span class="text-[10px] font-bold text-primary-600">{{ totalAssignedTasks }} Tasks Optimized</span>
               </div>
               <div class="flex-1 overflow-y-auto p-4 space-y-4">
                  <div v-for="assignment in (optimizedData as any).assignments" :key="assignment.officerId" class="p-4 bg-white rounded-2xl border border-primary-100 shadow-sm">
                     <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-2">
                           <div :style="{ backgroundColor: getOfficerColor(assignment.officerId) }" class="w-4 h-4 rounded-full ring-4 ring-primary-50"></div>
                           <span class="font-black text-xs text-gray-900">{{ assignment.officerName }}</span>
                        </div>
                        <span class="text-[9px] bg-primary-600 text-white px-2 py-1 rounded-lg font-black uppercase tracking-tighter">
                          {{ assignment.assignedIssues.length }} Jobs
                        </span>
                     </div>

                     <!-- Detailed Job List -->
                     <div class="space-y-2 mb-4">
                        <div v-for="(issueId, idx) in assignment.assignedIssues" :key="issueId" class="flex items-start gap-2 text-[10px] text-gray-600 bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                           <span class="w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center font-black text-[8px] flex-shrink-0 mt-0.5 text-primary-600">{{ idx + 1 }}</span>
                           <span class="flex-1 font-medium leading-tight">{{ getTaskDescription(issueId) }}</span>
                        </div>
                     </div>

                     <div class="grid grid-cols-2 gap-4 text-[10px] text-gray-500 pt-3 border-t border-gray-50 font-bold uppercase tracking-tight">
                        <div class="flex items-center gap-1.5">
                           <Icon name="heroicons:map" class="w-4 h-4 text-primary-400" />
                           {{ assignment.totalDistance.toFixed(1) }} KM
                        </div>
                        <div class="flex items-center gap-1.5 justify-end">
                           <Icon name="heroicons:clock" class="w-4 h-4 text-primary-400" />
                           ~{{ assignment.estimatedDuration }} MIN
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </transition>
       </div>

       <!-- Map Container -->
       <div class="lg:col-span-3 bg-gray-100 rounded-3xl shadow-inner overflow-hidden relative border border-gray-200">
          <ClientOnly>
            <div id="map" class="w-full h-full z-0"></div>
          </ClientOnly>
          
          <!-- Legend Overlay -->
          <div v-if="optimizedData" class="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 z-20 space-y-2 max-w-xs">
             <p class="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Active Routes</p>
             <div v-for="assignment in (optimizedData as any).assignments" :key="assignment.officerId" class="flex items-center gap-3">
                <div :style="{ backgroundColor: getOfficerColor(assignment.officerId) }" class="w-3 h-1 rounded-full"></div>
                <span class="text-xs font-bold text-gray-700 truncate">{{ assignment.officerName }}</span>
             </div>
          </div>

          <!-- Progress Overlay -->
          <transition name="fade">
             <div v-if="optimizing" class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center text-white">
                <div class="bg-white/10 p-12 rounded-full border border-white/20 animate-pulse relative">
                   <Icon name="heroicons:cpu-chip" class="w-20 h-20 text-primary-400 animate-spin" />
                </div>
                <h3 class="text-2xl font-black mt-8 tracking-tight">Computing Optimal Routes</h3>
                <p class="text-white/60 font-medium mt-2">Solving Vehicle Routing Problem (VRP) for {{ pendingTasks.length }} points</p>
             </div>
          </transition>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { reactive, computed, onMounted, ref } from 'vue'

let L: any = null

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const config = useRuntimeConfig()
const optimizing = ref(false)
const loading = ref(false)
const optimizedData = ref(null)
const map = ref<any>(null)
const markers = ref<any[]>([])
const polylines = ref<any[]>([])

const pendingTasks = ref<any[]>([])
const taskDescriptions = reactive(new Map<string, string>())

const getTaskDescription = (id: string) => {
   return taskDescriptions.get(id) || `Issue #${id.substring(0, 6)}`
}

const officerColors = {
   'John Doe': '#10b981', // Emerald
   'Jane Smith': '#f59e0b', // Amber
   'Mike Johnson': '#3b82f6', // Blue
   'Default': '#6366f1'
}

const HQ_LOCATION = { lat: -17.8465, lng: 31.0069 }

onMounted(async () => {
   if (process.client) {
      L = await import('leaflet')
      import('leaflet/dist/leaflet.css')
      initMap()
   }
})

const initMap = () => {
   setTimeout(() => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
         iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
         iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
         shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      map.value = L.map('map', { zoomControl: false }).setView([-17.8465, 31.0069], 13)
      L.control.zoom({ position: 'bottomleft' }).addTo(map.value)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
      }).addTo(map.value)

      // HQ Marker
      const homeIcon = L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:#059669; width: 2rem; height: 2rem; border-radius: 50%; border: 4px solid white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 10px;'>HQ</div>",
          iconSize: [32, 32],
          iconAnchor: [16, 16]
      });

      L.marker([HQ_LOCATION.lat, HQ_LOCATION.lng], { icon: homeIcon })
         .bindPopup('<b>Head Office</b><br>HIT Campus')
         .addTo(map.value)

      fetchPendingTasks() 
   }, 500)
}

const fetchPendingTasks = async () => {
    loading.value = true
    try {
        const authStore = useAuthStore()
        const data = await $fetch(`${config.public.apiBase}/issues`, {
            query: { status: 'PENDING' },
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        if (data) {
            const issues = (data as any).content || data
            if (Array.isArray(issues)) {
               issues.forEach((i: any) => taskDescriptions.set(i.id, i.title || i.description))
               pendingTasks.value = issues.map((i: any) => ({
                   id: i.id,
                   description: i.title || i.description,
                   priority: i.severity || 'MEDIUM',
                   ward: i.wardId || 'Unknown',
                   lat: i.location?.y || -17.82, 
                   lng: i.location?.x || 31.05
               }))
               plotTasks()
            }
        }
    } catch (e) {
        console.error('Failed to fetch tasks', e)
    } finally {
        loading.value = false
    }
}

const plotTasks = () => {
   if (!map.value) return
   markers.value.forEach(m => m.remove())
   markers.value = []

   pendingTasks.value.forEach(task => {
      const marker = L.marker([task.lat, task.lng])
         .bindPopup(`<b>${task.description}</b><br>Priority: ${task.priority}`)
         .addTo(map.value)
      markers.value.push(marker)
   })
}

const flyToTask = (task: any) => {
   map.value?.flyTo([task.lat, task.lng], 15)
}

const fetchOSRMRoute = async (coordinates: [number, number][]) => {
   if (!coordinates || coordinates.length < 2) return coordinates;
   const coordsString = coordinates.map(c => `${c[1]},${c[0]}`).join(';')
   const endpoints = [
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsString}?overview=full&geometries=geojson`,
      `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
   ]
   
   for (const url of endpoints) {
      try {
         const response = await fetch(url)
         const data = await response.json()
         if (data.code === 'Ok' && data.routes?.[0]) {
            return data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
         }
      } catch (e) {}
   }
   return coordinates
}

const optimizeRoutes = async () => {
  optimizing.value = true
  polylines.value.forEach(p => p.remove())
  polylines.value = []

  try {
     const authStore = useAuthStore()
     const response = await $fetch(`${config.public.apiBase}/tasks/optimize`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authStore.token}` },
        body: { issueIds: pendingTasks.value.map(t => t.id) }
     })

     if (response) {
        optimizedData.value = response as any
        
        for (const assignment of (response as any).assignments) {
           if (assignment.optimizedRoute?.length) {
              const coords: [number, number][] = [[HQ_LOCATION.lat, HQ_LOCATION.lng]]
              assignment.optimizedRoute.forEach((p: any) => coords.push([p.lat, p.lng]))
              coords.push([HQ_LOCATION.lat, HQ_LOCATION.lng])

              const streetPoints = await fetchOSRMRoute(coords)
              const polyline = L.polyline(streetPoints, { 
                 color: getOfficerColor(assignment.officerId), 
                 weight: 6, 
                 opacity: 0.8,
                 lineJoin: 'round',
                 lineCap: 'round'
              }).addTo(map.value)
              polylines.value.push(polyline)
           }
        }
        
        if (polylines.value.length) {
           const group = new L.FeatureGroup(polylines.value)
           map.value?.fitBounds(group.getBounds().pad(0.1))
        }

        setTimeout(() => fetchPendingTasks(), 1500)
     }
  } catch (e) {
     console.error('Optimization failed', e)
  } finally {
     optimizing.value = false
  }
}

const totalAssignedTasks = computed(() => {
   if (!optimizedData.value) return 0
   return (optimizedData.value as any).assignments.reduce((sum: number, a: any) => sum + a.assignedIssues.length, 0)
})

const officerColorsList = [
   '#10b981', // Emerald
   '#3b82f6', // Blue
   '#f59e0b', // Amber
   '#8b5cf6', // Violet
   '#ec4899', // Pink
   '#06b6d4', // Cyan
   '#f97316', // Orange
   '#ef4444'  // Red
]

const getOfficerColor = (id: string) => {
   if (!id) return '#6366f1'
   // Stable hash function for color selection
   let hash = 0
   for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash)
   }
   const index = Math.abs(hash) % officerColorsList.length
   return officerColorsList[index]
}

const getPriorityColor = (p: string) => {
   switch(p) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200'
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200'
      default: return 'bg-primary-50 text-primary-700 border-primary-200'
   }
}

const getPriorityBar = (p: string) => {
   switch(p) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      default: return 'bg-primary-500'
   }
}
</script>

<style>
.custom-div-icon { background: none; border: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
</style>
