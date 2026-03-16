<template>
  <div class="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-gray-100 shadow-inner">
    <div :id="mapId" class="w-full h-full z-0"></div>
  </div>
</template>

<script setup lang="ts">
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  hotspots?: any[]
}>()

const mapId = `map-${Math.random().toString(36).substr(2, 9)}`
let map: L.Map | null = null

onMounted(() => {
  // Fix Leaflet icons
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  })

  // Center on Harare
  const defaultLat = -17.824858
  const defaultLng = 31.053028

  map = L.map(mapId).setView([defaultLat, defaultLng], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  watch(() => props.hotspots, (newHotspots) => {
    if (!map || !newHotspots) return
    
    // Clear existing markers if any (simple implementation)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map?.removeLayer(layer)
      }
    })

    newHotspots.forEach((h: any) => {
      if (h.center && h.center.y && h.center.x) {
        L.marker([h.center.y, h.center.x])
          .addTo(map!)
          .bindPopup(`<b>${h.category || 'Cluster'}</b><br>Issues: ${h.issueCount || h.issues?.length || 'N/A'}`)
      } else if (h.location && h.location.y && h.location.x) {
          L.marker([h.location.y, h.location.x])
          .addTo(map!)
      }
    })
  }, { immediate: true })
})
</script>

<style>
.leaflet-pane { z-index: 0; }
</style>
