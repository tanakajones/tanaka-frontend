<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <!-- Toolbar -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center z-20 relative">
       <div>
          <h2 class="text-xl font-bold text-gray-800">Task Optimization</h2>
          <p class="text-sm text-gray-500">AI-driven route planning for field officers</p>
       </div>
       <button @click="optimizeRoutes" :disabled="optimizing || !pendingTasks.length" class="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-bold shadow-lg shadow-purple-500/30 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <Icon name="heroicons:cpu-chip" class="w-5 h-5 mr-2" :class="optimizing ? 'animate-spin' : ''" />
          {{ optimizing ? 'Optimizing...' : 'Run AI Optimization' }}
       </button>
    </div>

    <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 relative">
       <!-- Pending Tasks List -->
       <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden z-10 relative h-full">
          <div class="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
             <span>Pending Tasks</span>
             <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">{{ pendingTasks.length }}</span>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
             <div v-for="task in pendingTasks" :key="task.id" 
                  @click="flyToTask(task)"
                  class="p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
                <div class="flex justify-between items-start">
                   <h4 class="font-bold text-gray-800 text-sm group-hover:text-primary-700">{{ task.description }}</h4>
                   <span class="text-xs font-mono text-gray-400">#{{ task.id.substring(0,4) }}</span>
                </div>
                <div class="mt-2 text-xs text-gray-500 flex gap-2">
                   <span :class="getPriorityColor(task.priority)" class="px-2 py-0.5 rounded">{{ task.priority }}</span>
                   <span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">{{ task.ward }}</span>
                </div>
             </div>
          </div>
          
          <!-- Optimization Results Panel (appears below list when optimized) -->
          <div v-if="optimizedData" class="border-t-2 border-purple-100 bg-purple-50 p-4 max-h-[40%] overflow-y-auto">
             <h4 class="font-bold text-purple-800 mb-2 text-sm uppercase tracking-wide">Optimized Routes</h4>
             <div v-for="(route, officerName) in optimizedData.assignments" :key="officerName" class="mb-3 last:mb-0">
                <div class="flex items-center gap-2 mb-1">
                   <div :style="{ backgroundColor: getOfficerColor(officerName) }" class="w-2 h-2 rounded-full"></div>
                   <span class="font-bold text-xs text-gray-700">{{ officerName }}</span>
                   <span class="text-xs text-gray-500">({{ route.length }} tasks)</span>
                </div>
             </div>
          </div>
       </div>

       <!-- Map Container -->
       <div class="lg:col-span-2 bg-gray-100 rounded-xl shadow-inner overflow-hidden relative border border-gray-200">
          <div id="map" class="w-full h-full z-0"></div>
          
          <!-- Map Overlay (Optimization Status) -->
          <transition name="fade">
             <div v-if="optimizing" class="absolute inset-0 bg-white/60 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center">
                <Icon name="heroicons:cpu-chip" class="w-16 h-16 text-purple-600 animate-spin mb-4" />
                <h3 class="text-xl font-bold text-gray-800">Calculating Optimal Routes...</h3>
                <p class="text-gray-600">Analyzing traffic, distance, and priority constraints</p>
             </div>
          </transition>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Load Scripts for Google Mutant
// IMPORTANT: Replace 'YOUR_GOOGLE_MAPS_API_KEY' with a real key for Google Maps skins to work
useHead({
  script: [
    { src: 'https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY', async: true, defer: true },
    { src: 'https://unpkg.com/leaflet.gridlayer.googlemutant@latest/Leaflet.GoogleMutant.js', async: true, defer: true }
  ]
})

const config = useRuntimeConfig()
const optimizing = ref(false)
const optimizedData = ref(null)
const map = ref<L.Map | null>(null)
const markers = ref<L.Marker[]>([])
const polylines = ref<L.Polyline[]>([])

// Dummy Data for Logic Testing (Will be overwritten if backend responds)
const pendingTasks = ref<any[]>([
 { id: 'T001', description: 'Fix pothole on Sam Sora', priority: 'HIGH', ward: 'Barrowdale', lat: -17.784, lng: 31.053 },
 { id: 'T002', description: 'Clear drainage blockage', priority: 'CRITICAL', ward: 'Avondale', lat: -17.801, lng: 31.034 },
 { id: 'T003', description: 'Replace streetlight', priority: 'MEDIUM', ward: 'CBD', lat: -17.829, lng: 31.050 },
 { id: 'T004', description: 'Inspect bridge crack', priority: 'HIGH', ward: 'Mbare', lat: -17.857, lng: 31.041 },
 { id: 'T005', description: 'Remove fallen tree', priority: 'LOW', ward: 'Highlands', lat: -17.805, lng: 31.102 },
])

const officerColors = {
   'John Doe': '#8b5cf6', // Violet
   'Jane Smith': '#ec4899', // Pink
   'Mike Johnson': '#10b981' // Green
}

// HIT Coordinates
const HQ_LOCATION = { lat: -17.8465, lng: 31.0069 }

onMounted(() => {
   initMap()
})

const initMap = () => {
   setTimeout(() => {
      // Fix icons (Use CDN for reliability)
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
         iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
         iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
         shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Center map between HQ and Tasks
      map.value = L.map('map').setView([-17.83, 31.03], 13)

      // Google Layers
      if (L.gridLayer && (L.gridLayer as any).googleMutant) {
         const googleRoadmap = (L.gridLayer as any).googleMutant({
            type: 'roadmap'
         });
         const googleHybrid = (L.gridLayer as any).googleMutant({
            type: 'hybrid'
         });

         // Default to Roadmap (Street Names)
         map.value!.addLayer(googleRoadmap);

         const baseMaps = {
            "Street Map": googleRoadmap,
            "Satellite Hybrid": googleHybrid
         };

         L.control.layers(baseMaps).addTo(map.value!);
      } else {
         console.warn('Google Mutant not loaded, falling back to OpenStreetMap');
         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
         }).addTo(map.value!);
      }

      // Add HQ Marker
      const homeIcon = L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:#4f46e5; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;'>HQ</div>",
          iconSize: [24, 24],
          iconAnchor: [12, 12]
      });

      L.marker([HQ_LOCATION.lat, HQ_LOCATION.lng], { icon: homeIcon })
         .bindPopup('<b>Head Office</b><br>Harare Institute of Technology')
         .addTo(map.value!)

      // Plot initial (Mock) tasks
      plotTasks()

      // Attempt to fetch real tasks (if available, will overwrite mock data)
      fetchPendingTasks() 
   }, 1000)
}

const fetchPendingTasks = async () => {
    try {
        const { data } = await useAuthFetch('/issues', {
            query: { status: 'PENDING' }
        })
        if (data.value) {
            // Map issues to tasks format
            const issues = Array.isArray(data.value?.content) ? data.value.content : (Array.isArray(data.value) ? data.value : [])
            if (issues.length > 0) {
               pendingTasks.value = issues.map((i: any) => ({
                   id: i.id,
                   description: i.title || i.description,
                   priority: i.severity || 'MEDIUM',
                   ward: i.ward || 'Unknown',
                   lat: i.latitude || -17.82, // Fallback if missing
                   lng: i.longitude || 31.05
               }))
               plotTasks()
            }
        }
    } catch (e) {
        console.error('Failed to fetch tasks, using mock data', e)
    }
}

const plotTasks = () => {
   if (!map.value) return
   markers.value.forEach(m => m.remove())
   markers.value = []

   pendingTasks.value.forEach(task => {
      const marker = L.marker([task.lat, task.lng])
         .bindPopup(`<b>${task.description}</b><br>Priority: ${task.priority}`)
         .addTo(map.value!)
      markers.value.push(marker)
   })
}

const flyToTask = (task: any) => {
   map.value?.flyTo([task.lat, task.lng], 15)
}

// Simple Helper to calculate distance
const getDistance = (p1: {lat: number, lng: number}, p2: {lat: number, lng: number}) => {
   const R = 6371; // km
   const dLat = (p2.lat - p1.lat) * Math.PI / 180;
   const dLon = (p2.lng - p1.lng) * Math.PI / 180;
   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
             Math.sin(dLon/2) * Math.sin(dLon/2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
   return R * c;
}

const fetchOSRMRoute = async (coordinates: [number, number][]) => {
   const coordsString = coordinates.map(c => `${c[1]},${c[0]}`).join(';')
   const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
   
   try {
      const response = await fetch(url)
      const data = await response.json()
      if (data.code === 'Ok') {
         // OSRM returns [lng, lat], Leaflet wants [lat, lng]
         return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
      }
   } catch (e) {
      console.error('OSRM fetch failed', e)
   }
   return coordinates // Fallback to straight lines
}

const optimizeRoutes = async () => {
  optimizing.value = true
  polylines.value.forEach(p => p.remove())
  polylines.value = []

  try {
     await new Promise(r => setTimeout(r, 1500)) // Sim delay
     
     // Smarter Mock Optimization: Nearest Neighbor from HQ
     const unassigned = [...pendingTasks.value]
     const assignments: Record<string, any[]> = {
         'John Doe': [],
         'Jane Smith': [],
         'Mike Johnson': []
     }
     
     const officers = Object.keys(assignments)
     let officerIndex = 0

     // Distribute tasks greedily based on nearest to current location (start at HQ)
     const officerLocations: Record<string, {lat: number, lng: number}> = {}
     officers.forEach(o => officerLocations[o] = HQ_LOCATION)

     while (unassigned.length > 0) {
        const officer = officers[officerIndex]
        const currentLoc = officerLocations[officer]
        
        // Find nearest unassigned task
        let nearestTaskIndex = -1
        let minDist = Infinity

        unassigned.forEach((task, idx) => {
           const d = getDistance(currentLoc, task)
           // Prioritize critical slightly
           const weight = task.priority === 'CRITICAL' ? 0.5 : 1
           if (d * weight < minDist) {
              minDist = d * weight
              nearestTaskIndex = idx
           }
        })

        if (nearestTaskIndex !== -1) {
           const task = unassigned.splice(nearestTaskIndex, 1)[0]
           assignments[officer].push(task)
           officerLocations[officer] = { lat: task.lat, lng: task.lng } // Move officer
        }

        officerIndex = (officerIndex + 1) % officers.length
     }

     optimizedData.value = { assignments }

     // Draw Routes with OSRM
     for (const [officer, tasks] of Object.entries(assignments)) {
        const coords: [number, number][] = [[HQ_LOCATION.lat, HQ_LOCATION.lng]]
        tasks.forEach(t => coords.push([t.lat, t.lng]))

        if (coords.length > 1) {
           const color = getOfficerColor(officer)
           const streetPoints = await fetchOSRMRoute(coords)
           
           const polyline = L.polyline(streetPoints, { 
              color: color, 
              weight: 5, 
              opacity: 0.9,
              lineJoin: 'round'
           }).addTo(map.value!)
           polylines.value.push(polyline)
        }
     }
     
     // Fit bounds
     if (polylines.value.length > 0) {
        const group = new L.FeatureGroup(polylines.value)
        map.value?.fitBounds(group.getBounds().pad(0.1))
     }

  } catch (e) {
     alert('Optimization failed')
  } finally {
     optimizing.value = false
  }
}

const getOfficerColor = (name: string) => {
   return officerColors[name as keyof typeof officerColors] || '#6366f1'
}

const getPriorityColor = (p: string) => {
   switch(p) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border border-orange-200'
      default: return 'bg-green-100 text-green-800 border border-green-200'
   }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
