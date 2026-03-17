<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Icon name="heroicons:users" class="text-primary-600" />
        Workforce Status
      </h3>
      <button class="text-xs text-primary-600 hover:underline">Manage Officers</button>
    </div>

    <div class="space-y-4">
      <div v-for="officer in officers" :key="officer.id" class="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            {{ officer.name.charAt(0) }}
          </div>
          <div>
            <p class="font-bold text-gray-800 text-sm">{{ officer.name }}</p>
            <p class="text-xs text-gray-500">{{ officer.skills.join(', ') }}</p>
          </div>
        </div>
        <div class="text-right">
          <span :class="getStatusClass(officer.availabilityStatus)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
            {{ officer.availabilityStatus }}
          </span>
          <p class="text-[10px] text-gray-400 mt-1">Workload: {{ officer.workload }}/{{ officer.maxTasksPerDay }}</p>
        </div>
      </div>
      
      <div v-if="officers.length === 0" class="text-center py-4 text-gray-400 text-sm">
        No officers found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  officers: any[]
}>()

const getStatusClass = (status: string) => {
  switch (status) {
    case 'AVAILABLE': return 'bg-green-100 text-green-700'
    case 'BUSY': return 'bg-orange-100 text-orange-700'
    case 'OFF_DUTY': return 'bg-gray-100 text-gray-700'
    default: return 'bg-blue-100 text-blue-700'
  }
}
</script>
