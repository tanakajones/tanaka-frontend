<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
    <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
      <Icon :name="icon" class="w-5 h-5" :class="iconColor" />
      {{ title }}
    </h3>
    
    <div class="flex-1 flex items-center justify-center relative mb-6">
      <!-- SVG Pie Chart -->
      <svg viewBox="0 0 100 100" class="w-48 h-48 -rotate-90">
        <circle
          v-for="(segment, index) in segments"
          :key="index"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke-width="12"
          :stroke="segment.color"
          :stroke-dasharray="`${segment.percent} 100`"
          :stroke-dashoffset="-segment.offset"
          class="transition-all duration-1000 hover:stroke-[14px] cursor-pointer"
        >
          <title>{{ segment.label }}: {{ segment.value }}</title>
        </circle>
        <circle cx="50" cy="50" r="28" fill="white" />
      </svg>
      
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p class="text-2xl font-black text-gray-900">{{ total }}</p>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 mt-auto">
      <div v-for="segment in segments" :key="segment.label" class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: segment.color }"></div>
        <div class="flex flex-col">
           <span class="text-[10px] font-bold text-gray-400 uppercase leading-none">{{ segment.label }}</span>
           <span class="text-xs font-black text-gray-700">{{ segment.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  icon: string
  iconColor: string
  data: Record<string, number>
  colors?: string[]
}>()

const total = computed(() => Object.values(props.data).reduce((a, b) => a + b, 0))

const segments = computed(() => {
  let currentOffset = 0
  const colorPalette = props.colors || ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  
  return Object.entries(props.data).map(([label, value], index) => {
    const percent = (value / total.value) * (2 * Math.PI * 40)
    // Convert percentage of circumference to stroke-dasharray
    const dashValue = (value / total.value) * 251.3 // 2 * PI * r
    const segment = {
      label,
      value,
      percent: dashValue,
      offset: currentOffset,
      color: colorPalette[index % colorPalette.length]
    }
    currentOffset += dashValue
    return segment
  })
})
</script>
