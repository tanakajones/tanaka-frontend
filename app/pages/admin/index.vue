<template>
  <div class="space-y-6">
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="(stat, index) in stats" :key="index" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative overflow-hidden group">
         <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Icon :name="stat.icon" class="w-16 h-16" :class="stat.textClass" />
         </div>
         <div>
            <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
         </div>
         <div class="flex items-center gap-2 text-xs font-medium">
            <span :class="stat.trend > 0 ? 'text-green-600' : 'text-red-600'">
              {{ stat.trend > 0 ? '+' : ''}}{{ stat.trend }}%
            </span>
            <span class="text-gray-400">vs last period</span>
         </div>
      </div>
    </div>

    <!-- AI Insights & Workforce Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
       <!-- Primary Feed (2/3) -->
       <div class="lg:col-span-2 space-y-6">
          <!-- AI Insights Section -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 bg-gradient-to-br from-white to-primary-50/20">
             <div class="flex justify-between items-center mb-6">
               <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <Icon name="heroicons:sparkles" class="text-primary-600" />
                 AI Management Insights
               </h3>
               <span class="text-xs text-primary-600 font-bold uppercase tracking-wider">Live Analysis</span>
             </div>
             
             <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="insight in aiInsights" :key="insight.title" class="p-4 rounded-xl border border-primary-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                   <div class="flex items-center gap-2 mb-2">
                      <Icon :name="insight.icon" class="w-5 h-5" :class="insight.color" />
                      <h4 class="font-bold text-gray-800 text-sm">{{ insight.title }}</h4>
                   </div>
                   <p class="text-xs text-gray-600 leading-relaxed">{{ insight.description }}</p>
                   <div v-if="insight.metric" class="mt-2 text-xs font-bold text-primary-700">
                      {{ insight.metric }}
                   </div>
                </div>
             </div>
          </div>

          <!-- Hotspot Detection -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Icon name="heroicons:fire" class="text-red-500" />
                Problem Hotspots & Real-time Heatmap
              </h3>
              <span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full animate-pulse">Live</span>
            </div>
            
            <div class="flex-1 bg-gray-100 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[400px]">
               <HotspotMap :hotspots="hotspots" />
            </div>
          </div>
       </div>

       <!-- Side Panel (1/3) -->
       <div class="space-y-6">
          <!-- Workforce Summary -->
          <WorkforceSummary :officers="officers" />
          
          <!-- Recent Tasks -->
          <RecentTasks :issues="recentIssues" />
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Fetch Dashboard Data
const { data: metrics } = await useAuthFetch('/dashboard/metrics')
const { data: hotspotsData } = await useAuthFetch('/hotspots')
const { data: officersData } = await useAuthFetch('/officers')
const { data: issuesData } = await useAuthFetch('/issues', { query: { size: 5, sort: 'reportedAt,desc' } })

const stats = computed(() => [
  { label: 'Total Reports', value: metrics.value?.totalReports || 0, trend: 12, icon: 'heroicons:document-text', textClass: 'text-primary-600' },
  { label: 'Pending Issues', value: metrics.value?.pendingCount || 0, trend: -5, icon: 'heroicons:clock', textClass: 'text-yellow-600' },
  { label: 'Resolved', value: metrics.value?.resolvedCount || 0, trend: 8, icon: 'heroicons:check-circle', textClass: 'text-green-600' },
  { label: 'Active Workforce', value: officersData.value?.filter((o:any) => o.availabilityStatus === 'AVAILABLE').length || 0, trend: 0, icon: 'heroicons:users', textClass: 'text-blue-600' },
])

const hotspots = computed(() => hotspotsData.value?.clusters || hotspotsData.value || [])
const officers = computed(() => officersData.value || [])
const recentIssues = computed(() => {
  const content = issuesData.value?.content || issuesData.value || []
  return Array.isArray(content) ? content.slice(0, 5) : []
})

// Generate AI Insights based on data
const aiInsights = computed(() => {
  const insights = []
  
  // Workforce capacity insight
  const available = officers.value.filter((o:any) => o.availabilityStatus === 'AVAILABLE').length
  const total = officers.value.length
  if (total > 0) {
    const capacity = Math.round((available / total) * 100)
    insights.push({
      title: 'Current Workforce Capacity',
      description: available === 0 ? 'CRITICAL: No officers are currently available to handle pending tasks.' : `Your workforce is at ${capacity}% availability.`,
      metric: `${available} of ${total} officers active`,
      icon: 'heroicons:users',
      color: available === 0 ? 'text-red-500' : 'text-blue-500'
    })
  }

  // Task density insight
  const pending = metrics.value?.pendingCount || 0
  if (pending > 10) {
    insights.push({
      title: 'High Task Volume',
      description: 'AI detects a surge in pending reports. Consider running route optimization to clear the backlog.',
      metric: `${pending} issues awaiting action`,
      icon: 'heroicons:bolt',
      color: 'text-orange-500'
    })
  } else {
    insights.push({
      title: 'System Stability',
      description: 'Incoming issue flow is manageable within current workforce constraints.',
      metric: 'Flow: Normal',
      icon: 'heroicons:check-badge',
      color: 'text-green-500'
    })
  }

  // Category insight
  if (metrics.value?.issuesByCategory) {
    const entries = Object.entries(metrics.value.issuesByCategory)
    if (entries.length > 0) {
      const topCategory = entries.reduce((a, b) => (b[1] as number) > (a[1] as number) ? b : a)
      insights.push({
        title: 'Primary Concern',
        description: `Most reported issues currently fall under ${topCategory[0]}. Specialist allocation recommended.`,
        metric: `Top: ${topCategory[0]}`,
        icon: 'heroicons:light-bulb',
        color: 'text-primary-500'
      })
    }
  }

  return insights.slice(0, 3)
})

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'CRITICAL': return 'bg-red-100 text-red-800'
    case 'HIGH': return 'bg-orange-100 text-orange-800'
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-green-100 text-green-800'
  }
}
</script>
