<template>
  <div class="relative w-full h-96 rounded-xl overflow-hidden border border-gray-300 shadow-inner">
    <div id="map" class="w-full h-full z-0"></div>
    <div class="absolute bottom-4 left-4 z-[400] bg-white p-2 rounded-lg shadow-lg opacity-90 text-xs">
      Click to select location
    </div>
  </div>
</template>

<script setup lang="ts">
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  modelValue?: { lat: number; lng: number }
}>()

const emit = defineEmits(['update:modelValue'])

let map: L.Map | null = null
let marker: L.Marker | null = null

onMounted(async () => {
  // Fix Leaflet icons
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  })

  // Center on Harare/Zimbabwe default or user location
  const defaultLat = -17.824858
  const defaultLng = 31.053028

  map = L.map('map').setView([defaultLat, defaultLng], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  map.on('click', (e: L.LeafletMouseEvent) => {
    updateMarker(e.latlng.lat, e.latlng.lng)
  })

  // Try to get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      if (map) {
        map.setView([position.coords.latitude, position.coords.longitude], 15)
      }
    })
  }
})

function updateMarker(lat: number, lng: number) {
  if (marker) {
    marker.setLatLng([lat, lng])
  } else if (map) {
    marker = L.marker([lat, lng]).addTo(map)
  }
  emit('update:modelValue', { lat, lng })
}

// Watch for external updates
watch(() => props.modelValue, (newVal) => {
  if (newVal && map) {
    updateMarker(newVal.lat, newVal.lng)
    map.setView([newVal.lat, newVal.lng], map.getZoom())
  }
})
</script>

<style>
/* Leaflet z-index fix if needed */
.leaflet-pane { z-index: 0; }
</style>
