<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
    <h3 class="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
      <Icon name="heroicons:presentation-chart-line" class="w-5 h-5 text-indigo-500" />
      Reporting Trends
    </h3>
    
    <div class="flex items-end justify-between h-48 gap-4 px-2">
      <div v-for="(value, label) in data" :key="label" class="flex-1 flex flex-col items-center group relative">
        <!-- Value Tooltip -->
        <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
           {{ value }} Issues
        </div>
        
        <!-- Bar -->
        <div class="w-full bg-gray-50 rounded-t-xl relative overflow-hidden flex flex-col justify-end h-full">
           <div 
             class="w-full bg-indigo-500 rounded-t-xl transition-all duration-1000 group-hover:bg-indigo-400 group-hover:scale-x-105" 
             :style="{ height: (value / maxValue * 100) + '%' }"
           >
              <div class="w-full h-full bg-gradient-to-t from-black/10 to-transparent"></div>
           </div>
        </div>
        
        <!-- Label -->
        <span class="text-[10px] font-black text-gray-400 mt-3 uppercase tracking-widest">{{ label }}</span>
      </div>
    </div>
    
    <div v-if="!data || Object.keys(data).length === 0" class="h-48 flex items-center justify-center text-gray-300 text-xs italic">
       No trend data available
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: Record<string, number>
}>()

const maxValue = computed(() => {
  const values = Object.values(props.data)
  return values.length > 0 ? Math.max(...values, 1) : 1
})
</script>
