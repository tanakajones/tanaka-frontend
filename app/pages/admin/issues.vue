<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
       <h2 class="text-2xl font-bold text-gray-800">Issue Management</h2>
       <div class="flex gap-2">
          <button class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 flex items-center">
             <Icon name="heroicons:funnel" class="w-5 h-5 mr-2" />
             Filter
          </button>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center shadow-lg shadow-primary-500/30">
             <Icon name="heroicons:arrow-down-tray" class="w-5 h-5 mr-2" />
             Export
          </button>
       </div>
    </div>

    <!-- Issues Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
       <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 text-gray-600 font-bold text-sm">
              <tr>
                 <th class="p-4 border-b">ID</th>
                 <th class="p-4 border-b">Title</th>
                 <th class="p-4 border-b">Category</th>
                 <th class="p-4 border-b">Severity</th>
                 <th class="p-4 border-b">Assigned To</th>
                 <th class="p-4 border-b">Status</th>
                 <th class="p-4 border-b text-right">Actions</th>
              </tr>
           </thead>
           <tbody class="divide-y divide-gray-100 text-sm">
              <tr v-for="issue in issues" :key="issue.id" class="hover:bg-gray-50 group transition-colors">
                 <td class="p-4 text-gray-400 font-mono">#{{ issue.id.substring(0, 6) }}</td>
                 <td class="p-4 font-medium text-gray-900">{{ issue.title }}</td>
                 <td class="p-4">
                    <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">{{ issue.category }}</span>
                 </td>
                 <td class="p-4">
                    <span :class="getSeverityColor(issue.severity)" class="px-2 py-1 rounded-full text-xs font-bold border">{{ issue.severity }}</span>
                 </td>
                 <td class="p-4">
                    <div v-if="issue.assignedOfficerId" class="flex items-center gap-2">
                       <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                          {{ officers.find(o => o.id === issue.assignedOfficerId)?.name?.charAt(0) || 'O' }}
                       </div>
                       <span class="text-gray-600">{{ officers.find(o => o.id === issue.assignedOfficerId)?.name || 'Unknown' }}</span>
                    </div>
                    <span v-else class="text-gray-400 italic">Unassigned</span>
                 </td>
                 <td class="p-4">
                    <span :class="getStatusColor(issue.status)" class="px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                       <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDot(issue.status)"></span>
                       {{ issue.status }}
                    </span>
                 </td>
                 <td class="p-4 text-right">
                    <button @click="openModal(issue)" class="text-gray-400 hover:text-primary-600 transition-colors">
                       <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                    </button>
                 </td>
              </tr>
           </tbody>
        </table>
     </div>
 
     <!-- Status Modal -->
     <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
           <div class="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 class="text-lg font-bold text-gray-900">Issue Details & Management</h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                 <Icon name="heroicons:x-mark" class="w-6 h-6" />
              </button>
           </div>
           <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <!-- Image with AI Confidence -->
              <div class="relative w-full h-56 bg-gray-100 rounded-xl overflow-hidden mb-4 group">
                 <img v-if="selectedIssue?.imagePath" :src="selectedIssue.imagePath.startsWith('http') ? selectedIssue.imagePath : `${config.public.apiBase.replace('/api', '')}${selectedIssue.imagePath}`" class="w-full h-full object-cover">
                 <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <Icon name="heroicons:photo" class="w-12 h-12" />
                 </div>
                 <div v-if="selectedIssue?.confidence" class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 flex items-center gap-2">
                    <Icon name="heroicons:cpu-chip" class="w-4 h-4 text-primary-400" />
                    AI confidence: {{ (selectedIssue.confidence * 100).toFixed(1) }}%
                 </div>
              </div>
 
              <!-- Details -->
              <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                    <p class="font-bold text-gray-900">{{ selectedIssue?.category }}</p>
                 </div>
                 <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide">Severity</label>
                    <p class="font-bold text-gray-900 flex items-center gap-1">
                       <span :class="getSeverityColor(selectedIssue?.severity)" class="w-2 h-2 rounded-full"></span>
                       {{ selectedIssue?.severity }}
                    </p>
                 </div>
              </div>
 
              <div>
                 <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                 <p class="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-1 leading-relaxed">{{ selectedIssue?.description }}</p>
              </div>
 
              <div class="pt-4 border-t border-gray-100 grid grid-cols-2 gap-6">
                  <div>
                      <label class="block text-sm font-bold text-gray-700 mb-2">Update Status</label>
                      <select v-model="newStatus" class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium">
                         <option value="PENDING">PENDING</option>
                         <option value="IN_PROGRESS">IN PROGRESS</option>
                         <option value="RESOLVED">RESOLVED</option>
                         <option value="REJECTED">REJECTED</option>
                      </select>
                  </div>
                  <div>
                      <label class="block text-sm font-bold text-gray-700 mb-2">Assign Officer</label>
                      <select v-model="assignedTo" class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium">
                         <option value="">Unassigned</option>
                         <option v-for="officer in officers" :key="officer.id" :value="officer.id">
                            {{ officer.name }} ({{ officer.workload }} tasks)
                         </option>
                      </select>
                  </div>
              </div>
           </div>
           <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button @click="closeModal" class="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-bold transition-colors">Cancel</button>
              <button @click="updateStatus" :disabled="loading" class="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 font-bold shadow-md transition-all disabled:opacity-50">
                 {{ loading ? 'Saving...' : 'Save Management Data' }}
              </button>
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
const showModal = ref(false)
const selectedIssue = ref<any>(null)
const { data: issuesData, refresh: refreshIssues } = await useAuthFetch('/issues')
const { data: officersData } = await useAuthFetch('/officers')

const issues = computed<any[]>(() => {
  if (!issuesData.value) return []
  return (issuesData.value as any).content || issuesData.value || []
})

const officers = computed(() => {
  return (officersData.value as any) || []
})

const newStatus = ref('')
const assignedTo = ref('')
const loading = ref(false)

const openModal = (issue: any) => {
   selectedIssue.value = issue
   newStatus.value = issue.status
   assignedTo.value = issue.assignedOfficerId || ''
   showModal.value = true
}

const closeModal = () => {
   showModal.value = false
   selectedIssue.value = null
}

const authStore = useAuthStore()

const updateStatus = async () => {
   if (!selectedIssue.value) return
   loading.value = true
   try {
      // Update Status
      if (newStatus.value !== selectedIssue.value.status) {
         await $fetch(`${config.public.apiBase}/issues/${selectedIssue.value.id}/status`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${authStore.token}` },
            params: { status: newStatus.value }
         })
      }

      // Update Assignment
      if (assignedTo.value !== (selectedIssue.value.assignedOfficerId || '')) {
         await $fetch(`${config.public.apiBase}/issues/${selectedIssue.value.id}/assign`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${authStore.token}` },
            params: { officerId: assignedTo.value }
         })
      }

      await refreshIssues()
      closeModal()
   } catch (e) {
      alert('Failed to update issue')
   } finally {
      loading.value = false
   }
}

const getSeverityColor = (sev: string) => {
   switch(sev) {
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200'
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
   }
}

const getStatusColor = (status: string) => {
   switch(status) {
      case 'RESOLVED': return 'bg-green-50 text-green-700'
      case 'PENDING': return 'bg-yellow-50 text-yellow-700'
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700'
      default: return 'bg-gray-100 text-gray-600'
   }
}

const getStatusDot = (status: string) => {
   switch(status) {
      case 'RESOLVED': return 'bg-green-500'
      case 'PENDING': return 'bg-yellow-500'
      case 'IN_PROGRESS': return 'bg-blue-500'
      default: return 'bg-gray-500'
   }
}
</script>
