<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Icon name="heroicons:user-group" class="text-blue-500" />
        Workforce Load vs Issues
      </h3>
      <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full bg-primary-500"></div>
          Workload
        </div>
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full bg-gray-200"></div>
          Capacity
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div v-for="officer in officers" :key="officer.id" class="space-y-2">
        <div class="flex justify-between text-xs font-bold">
          <span class="text-gray-700">{{ officer.name }}</span>
          <span class="text-gray-400">{{ officer.workload }} / {{ officer.maxTasksPerDay }} Tasks</span>
        </div>
        <div class="relative w-full h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
          <div 
            class="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full transition-all duration-1000"
            :style="{ width: (officer.workload / officer.maxTasksPerDay * 100) + '%' }"
          ></div>
          <div 
            v-if="officer.workload > officer.maxTasksPerDay"
            class="absolute left-0 top-0 h-full bg-red-500/20 rounded-full"
            :style="{ width: '100%' }"
          ></div>
        </div>
        <div class="flex flex-wrap gap-1">
          <span v-for="skill in officer.skills" :key="skill" class="text-[8px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100 font-bold uppercase">
            {{ skill }}
          </span>
        </div>
      </div>
      
      <div v-if="officers.length === 0" class="py-12 text-center">
        <Icon name="heroicons:users" class="w-12 h-12 text-gray-100 mx-auto" />
        <p class="text-xs text-gray-400 font-bold mt-2">No workforce data available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  officers: any[]
}>()
</script>
