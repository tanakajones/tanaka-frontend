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

  // Layer groups for management
  const hotspotLayerGroup = L.layerGroup().addTo(map!)
  const markerLayerGroup = L.layerGroup().addTo(map!)

  // Fetch hotspots from API directly
  fetchHotspotHeatmap(L, hotspotLayerGroup)

  watch(() => props.hotspots, (newHotspots) => {
    if (!map || !newHotspots) return
    
    // Clear marker layer only
    markerLayerGroup.clearLayers()

    newHotspots.forEach((h: any) => {
      const lat = h.center?.lat || h.location?.y || h.center?.y || h.lat
      const lng = h.center?.lng || h.location?.x || h.center?.x || h.lng
      
      if (lat && lng) {
        // Add Marker to marker layer
        L.marker([lat, lng])
          .addTo(markerLayerGroup)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg border-b mb-2">${h.category || 'Cluster'}</h3>
              <p><b>Issues:</b> ${h.issueCount || 'N/A'}</p>
              <p><b>Severity:</b> <span class="text-orange-600 font-bold">${h.severityLevel || 'MEDIUM'}</span></p>
              ${h.intensity ? `<p><b>Intensity:</b> ${h.intensity.toFixed(2)}</p>` : ''}
            </div>
          `)

        // Add Circle to marker layer for focus
        L.circle([lat, lng], {
          radius: 300,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 1
        }).addTo(markerLayerGroup)
      }
    })
  }, { immediate: true })
})

const fetchHotspotHeatmap = async (L: any, layerGroup: any) => {
  try {
     const data = await $fetch(`${config.public.apiBase}/dashboard/hotspots`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
     })
     
     if (Array.isArray(data)) {
        layerGroup.clearLayers() // Prevent ghosting
        data.forEach((hotspot: any) => {
           // Plot hotspot as a red circle with radius based on intensity/count
           L.circle([hotspot.lat, hotspot.lng], {
              radius: Math.max(hotspot.issueCount * 250, 500), // Radius grows with count, min 500m
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: Math.min(hotspot.intensity * 0.15, 0.6), // Opacity grows with intensity
              weight: 2
           }).addTo(layerGroup)
           .bindPopup(`
              <div class="p-2">
                 <h3 class="font-bold text-red-600 text-lg border-b mb-2">HOTSPOT: ${hotspot.category}</h3>
                 <p><b>Issue Count:</b> ${hotspot.issueCount}</p>
                 <p><b>Intensity Score:</b> ${hotspot.intensity.toFixed(2)}</p>
                 <p class="text-xs text-gray-500 mt-2 italic">Urgent infrastructure focus area.</p>
              </div>
           `)
        })
     }
  } catch (e) {
     console.error('Failed to fetch hotspot data', e)
  }
}
</script>

<style>
.leaflet-pane { z-index: 0; }
</style>
