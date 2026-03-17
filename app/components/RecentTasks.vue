<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
        <Icon name="heroicons:megaphone" class="text-orange-600" />
        New Issues & Tasks
      </h3>
      <NuxtLink to="/admin/issues" class="text-xs text-primary-600 hover:underline">View All</NuxtLink>
    </div>

    <div class="space-y-4">
      <div v-for="issue in issues" :key="issue.id" class="p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors flex gap-4">
        <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img v-if="issue.imageUrl" :src="getImageUrl(issue.imageUrl)" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
             <Icon name="heroicons:photo" class="w-6 h-6" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <p class="font-bold text-gray-800 text-sm truncate">{{ issue.title || issue.description }}</p>
            <span :class="getSeverityClass(issue.severity)" class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ml-2">
              {{ issue.severity }}
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-0.5">{{ issue.ward || 'General' }} • {{ formatDate(issue.reportedAt) }}</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{{ issue.category }}</span>
            <span class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{{ issue.status }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="issues.length === 0" class="text-center py-8 text-gray-400 text-sm">
        No new issues reported.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  issues: any[]
}>()

const config = useRuntimeConfig()

const getImageUrl = (path: string) => {
  if (!path) return ''
  const baseUrl = config.public.apiBase.replace('/api', '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Just now'
  const date = new Date(dateStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getSeverityClass = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-600 text-white'
    case 'HIGH': return 'bg-orange-500 text-white'
    case 'MEDIUM': return 'bg-yellow-500 text-white'
    default: return 'bg-green-500 text-white'
  }
}
</script>
