<template>
  <ClientOnly>
    <div class="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-gray-100 shadow-inner">
      <div :id="mapId" class="w-full h-full z-0"></div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const props = defineProps<{
  hotspots?: any[]
}>()

const mapId = `map-${Math.random().toString(36).substr(2, 9)}`
let map: any = null
let L: any = null
let heatmapLayer: any[] = []
const config = useRuntimeConfig()
const authStore = useAuthStore()

onMounted(async () => {
  if (!process.client) return
  
  L = await import('leaflet')
  import('leaflet/dist/leaflet.css')

  // Fix Leaflet icons
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  // Center on Harare
  const defaultLat = -17.824858
  const defaultLng = 31.053028

  map = L.map(mapId).setView([defaultLat, defaultLng], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // Fetch and individual tasks heatmap
  fetchHeatmapData(L)

  watch(() => props.hotspots, (newHotspots) => {
    if (!map || !newHotspots) return
    
    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map?.removeLayer(layer)
      }
    })

    newHotspots.forEach((h: any) => {
      const lat = h.center?.lat || h.location?.y || h.center?.y
      const lng = h.center?.lng || h.location?.x || h.center?.x
      
      if (lat && lng) {
        // Add Marker
        L.marker([lat, lng])
          .addTo(map!)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg border-b mb-2">${h.category || 'Cluster'}</h3>
              <p><b>Issues:</b> ${h.issueCount || 'N/A'}</p>
              <p><b>Severity:</b> <span class="text-orange-600 font-bold">${h.severityLevel || 'MEDIUM'}</span></p>
              ${h.intensity ? `<p><b>Intensity:</b> ${h.intensity}</p>` : ''}
            </div>
          `)

        // Add Intensity Circle if available
        if (h.intensity) {
          L.circle([lat, lng], {
            radius: Math.min(h.intensity * 50, 1000),
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.3,
            weight: 1
          }).addTo(map!)
        }
      }
    })
  }, { immediate: true })
})

const fetchHeatmapData = async (L: any) => {
  try {
     const data = await $fetch(`${config.public.apiBase}/dashboard/heatmap`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
     })
     
     if (Array.isArray(data)) {
        data.forEach((point: any) => {
           // Plot individual task as a soft red circle (heatmap effect)
           L.circle([point[0], point[1]], {
              radius: 200,
              color: 'transparent',
              fillColor: '#ef4444',
              fillOpacity: point[2] * 0.4,
              interactive: false
           }).addTo(map!)
        })
     }
  } catch (e) {
     console.error('Failed to fetch heatmap data', e)
  }
}
</script>

<style>
.leaflet-pane { z-index: 0; }
</style>
