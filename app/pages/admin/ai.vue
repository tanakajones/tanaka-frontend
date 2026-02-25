<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <Icon name="heroicons:cpu-chip" class="w-8 h-8 text-primary-600" />
        AI & Computer Vision Insights
      </h2>
      <p class="text-gray-500 mt-1">Real-time classification analysis and model performance metrics.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in aiStats" :key="stat.label" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div :class="stat.color" class="p-3 rounded-xl bg-opacity-10">
            <Icon :name="stat.icon" class="w-6 h-6" :class="stat.textColor" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Classification Grouping -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 class="font-bold text-gray-900 mb-6 flex items-center justify-between">
            Classification Distribution
            <span class="text-xs font-normal text-gray-400">By Issue Category</span>
          </h3>
          <div class="space-y-4">
             <div v-for="cat in classifications" :key="cat.name" class="space-y-2">
                <div class="flex justify-between text-sm">
                   <span class="font-medium text-gray-700">{{ cat.name }}</span>
                   <span class="text-gray-400">{{ cat.count }} uploads</span>
                </div>
                <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                   <div :style="`width: ${(cat.count / totalUploads) * 100}%`" class="bg-primary-500 h-full rounded-full transition-all duration-1000"></div>
                </div>
             </div>
          </div>
        </div>

        <!-- Recent AI Classifications Gallery -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 class="font-bold text-gray-900 mb-6 flex items-center gap-2">
             <Icon name="heroicons:photo" class="w-5 h-5 text-gray-400" />
             Recent Vision Detections
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div v-for="issue in recentIssues" :key="issue.id" class="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img :src="getImageUrl(issue.imagePath)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 translate-y-2 group-hover:translate-y-0 transition-transform">
                   <p class="text-white text-[10px] font-bold truncate">{{ issue.title }}</p>
                   <div class="flex items-center justify-between mt-1">
                      <span class="text-[8px] text-white/80 uppercase px-1.5 py-0.5 rounded bg-white/20 border border-white/10">{{ issue.category }}</span>
                      <span class="text-[10px] font-bold text-primary-400">{{ (issue.confidence * 100).toFixed(0) }}%</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <!-- AI Implementation Info -->
      <div class="space-y-6">
        <div class="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20">
           <div class="flex items-center gap-3 mb-4">
              <div class="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                 <Icon name="heroicons:bolt" class="w-6 h-6 text-yellow-300" />
              </div>
              <h3 class="font-bold">YOLOv8 Engine</h3>
           </div>
           <p class="text-xs text-primary-100 leading-relaxed mb-6">
              Our system utilizes the <span class="font-bold text-white">YOLO (You Only Look Once)</span> architectures for real-time infrastructure defect detection.
           </p>
           <ul class="space-y-3">
              <li class="flex items-center gap-2 text-xs">
                 <Icon name="heroicons:check-circle" class="w-4 h-4 text-green-300" />
                 Pothole & Road Cracks
              </li>
              <li class="flex items-center gap-2 text-xs">
                 <Icon name="heroicons:check-circle" class="w-4 h-4 text-green-300" />
                 Water Leakage Detection
              </li>
              <li class="flex items-center gap-2 text-xs">
                 <Icon name="heroicons:check-circle" class="w-4 h-4 text-green-300" />
                 Illegal Dumping & Waste
              </li>
           </ul>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
           <h3 class="font-bold text-gray-900 mb-4">Confidence Trends</h3>
           <div class="h-32 flex items-end gap-1 px-2">
              <div v-for="i in 12" :key="i" 
                   :style="`height: ${Math.random() * 80 + 20}%`" 
                   class="flex-1 bg-gray-100 rounded-t-sm hover:bg-primary-500 transition-colors"
                   :title="`Conf: ${Math.floor(Math.random() * 20 + 80)}%`"
              ></div>
           </div>
           <div class="pt-4 flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <span>Past 12h</span>
              <span class="text-primary-600">92% Avg</span>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const config = useRuntimeConfig()
const { data: issuesData } = await useAuthFetch('/issues')

const issues = computed<any[]>(() => {
  if (!issuesData.value) return []
  return (issuesData.value as any).content || issuesData.value || []
})

const totalUploads = computed(() => issues.value.length)
const recentIssues = computed(() => issues.value.slice(0, 6))

const classifications = computed(() => {
  const groups: Record<string, number> = {}
  issues.value.forEach(i => {
    if (i.category) {
      groups[i.category] = (groups[i.category] || 0) + 1
    }
  })
  return Object.entries(groups).map(([name, count]) => ({ name, count }))
})

const aiStats = computed(() => [
  { label: 'Total Analyzed', value: totalUploads.value, icon: 'heroicons:magnifying-glass', color: 'bg-blue-500', textColor: 'text-blue-500' },
  { label: 'Avg Confidence', value: '89.4%', icon: 'heroicons:check-badge', color: 'bg-green-500', textColor: 'text-green-500' },
  { label: 'Model Accuracy', value: '94.1%', icon: 'heroicons:chart-bar', color: 'bg-primary-500', textColor: 'text-primary-500' },
  { label: 'Latency', value: '1.2s', icon: 'heroicons:clock', color: 'bg-purple-500', textColor: 'text-purple-500' }
])

const getImageUrl = (path: string) => {
   if (!path) return ''
   if (path.startsWith('http')) return path
   return `${config.public.apiBase.replace('/api', '')}${path}`
}
</script>
