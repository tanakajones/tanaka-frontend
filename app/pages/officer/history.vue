<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-black text-gray-900 tracking-tight">Completion History</h2>
      <p class="text-gray-500 font-medium">Review your finished service tasks and quality reports</p>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">ID</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Task Description</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Date Completed</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Quality</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="job in history" :key="job.id" class="hover:bg-primary-50/30 transition-colors">
              <td class="px-6 py-4 text-xs font-mono text-gray-400">#{{ job.id.substring(0, 8) }}</td>
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900 text-sm">{{ job.description }}</div>
                <div class="text-[10px] text-gray-500">{{ job.ward }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(job.completedAt) }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-0.5">
                  <Icon v-for="i in 5" :key="i" 
                    name="heroicons:star-solid" 
                    class="w-4 h-4" 
                    :class="i <= (job.qualityRating || 0) ? 'text-amber-400' : 'text-gray-200'" />
                </div>
              </td>
              <td class="px-6 py-4">
                <button @click="viewDetails(job)" class="text-xs font-bold text-primary-600 hover:text-primary-800 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-lg transition-all">Details</button>
              </td>
            </tr>
            <tr v-if="!history.length && !loading">
              <td colspan="5" class="px-6 py-20 text-center">
                <div class="flex flex-col items-center">
                  <Icon name="heroicons:archive-box" class="w-12 h-12 text-gray-200 mb-4" />
                  <p class="text-gray-500 font-bold">No completed jobs found in your history.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="selectedJob" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-md" @click="selectedJob = null"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 overflow-hidden">
          <div class="flex justify-between items-start mb-6">
            <h3 class="text-2xl font-black text-gray-900">Job Detail Record</h3>
            <button @click="selectedJob = null" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Icon name="heroicons:x-mark" class="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <label class="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Status</label>
                <span class="text-sm font-bold text-green-600">COMPLETED</span>
              </div>
              <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <label class="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Priority</label>
                <span class="text-sm font-bold text-primary-600">{{ selectedJob.priority }}</span>
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Description</label>
              <p class="text-gray-800 font-medium leading-relaxed">{{ selectedJob.description }}</p>
            </div>

            <div class="pt-6 border-t border-gray-50">
              <label class="text-[10px] font-black uppercase text-primary-400 tracking-widest block mb-3 italic">Final Resolution Report</label>
              <div class="p-6 bg-primary-50/50 rounded-2xl text-primary-900 border border-primary-100 italic relative">
                <Icon name="heroicons:chat-bubble-bottom-center-text" class="absolute -left-2 -top-2 w-8 h-8 text-primary-200" />
                "{{ selectedJob.notes || 'No notes provided for this resolution.' }}"
              </div>
            </div>

            <div class="flex justify-between items-center pt-6">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Icon name="heroicons:star-solid" class="w-6 h-6 text-amber-400" />
                </div>
                <div>
                   <p class="text-[10px] font-black uppercase text-gray-400">Quality Rating</p>
                   <p class="text-sm font-bold text-gray-900">{{ selectedJob.qualityRating }} / 5 Stars</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-black uppercase text-gray-400">Completion Timestamp</p>
                <p class="text-sm font-bold text-gray-900">{{ formatDate(selectedJob.completedAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'officer',
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const history = ref<any[]>([])
const loading = ref(false)
const selectedJob = ref<any | null>(null)

onMounted(() => {
  fetchHistory()
})

const fetchHistory = async () => {
  loading.value = true
  try {
    let officerId = authStore.user?.officerId

    // If officerId is missing, try to find it by email
    if (!officerId && authStore.user?.email) {
      const officers = await $fetch(`${config.public.apiBase}/officers`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      const me = (officers as any[]).find(o => o.email === authStore.user.email)
      if (me) {
        officerId = me.id
        authStore.user.officerId = me.id
      }
    }

    if (!officerId) return

    const data = await $fetch(`${config.public.apiBase}/tasks/officer/${officerId}`, {
      query: { type: 'completed' },
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    const tasks = (data as any[]) || []
    
    if (tasks.length > 0) {
      // Enrich with issue data
      const enriched = await Promise.all(tasks.map(async (task: any) => {
        try {
          const issue = await $fetch(`${config.public.apiBase}/issues/${task.issueId}`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })
          return { ...task, ...issue, taskId: task.id }
        } catch (e) {
          return task
        }
      }))
      history.value = enriched
    } else {
      history.value = []
    }
  } catch (e) {
    console.error('Failed to fetch history', e)
  } finally {
    loading.value = false
  }
}

const viewDetails = (job: any) => {
  selectedJob.value = job
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-GB', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
