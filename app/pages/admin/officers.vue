<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
       <h2 class="text-2xl font-bold text-gray-800">Officer Management</h2>
       <button @click="openAddModal" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center shadow-lg shadow-primary-500/30">
          <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
          Add Officer
       </button>
    </div>

    <!-- Officers Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <div v-for="officer in (officers as any[])" :key="officer.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div class="w-20 h-20 rounded-full bg-gray-100 mb-4 flex items-center justify-center text-2xl font-bold text-gray-500">
             {{ officer.name ? officer.name.charAt(0) : 'O' }}
          </div>
          <h3 class="font-bold text-lg text-gray-900">{{ officer.name }}</h3>
          <p class="text-sm text-gray-500 mb-2">{{ officer.email }}</p>
          <div class="flex gap-2 mb-4 flex-wrap justify-center">
             <span v-for="skill in officer.skills" :key="skill" class="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-bold border border-primary-100">{{ skill }}</span>
          </div>
          <div class="mt-auto w-full pt-4 border-t border-gray-100 flex justify-between items-center gap-4">
             <div class="flex items-center gap-2">
                <span :class="officer.availabilityStatus === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'" class="text-[10px] font-bold px-2 py-0.5 rounded-full border border-current opacity-80 uppercase tracking-wider">
                   {{ officer.availabilityStatus }}
                </span>
             </div>
             <div class="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                <button 
                  @click="openEditSkills(officer)" 
                  title="Edit Skills"
                  class="p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-white transition-all shadow-sm">
                   <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                </button>
                <button 
                  @click="updateAvailability(officer, 'AVAILABLE')" 
                  title="Mark Available"
                  :class="officer.availabilityStatus === 'AVAILABLE' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-green-500'" 
                  class="p-1.5 rounded-md transition-all">
                   <Icon name="heroicons:check-circle" class="w-4 h-4" />
                </button>
                <button 
                  @click="updateAvailability(officer, 'BUSY')" 
                  title="Mark Busy"
                  :class="officer.availabilityStatus === 'BUSY' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400 hover:text-amber-500'" 
                  class="p-1.5 rounded-md transition-all">
                   <Icon name="heroicons:no-symbol" class="w-4 h-4" />
                </button>
             </div>
          </div>
       </div>
    </div>

    <!-- Edit Skills Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
       <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 class="text-lg font-bold text-gray-900">Update Skills: {{ selectedOfficer?.name }}</h3>
             <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-500">
                <Icon name="heroicons:x-mark" class="w-6 h-6" />
             </button>
          </div>
          <div class="p-6">
             <label class="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
             <input v-model="editSkillsForm" type="text" placeholder="Road Repair, Drainage" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
          </div>
          <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
             <button @click="showEditModal = false" class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
             <button @click="updateSkills" :disabled="loading" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-lg shadow-primary-500/30">
                {{ loading ? 'Saving...' : 'Save Changes' }}
             </button>
          </div>
       </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
       <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
             <h3 class="text-lg font-bold text-gray-900">Add New Officer</h3>
             <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                <Icon name="heroicons:x-mark" class="w-6 h-6" />
             </button>
          </div>
          <div class="p-6 space-y-4">
             <div class="grid grid-cols-2 gap-4">
               <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input v-model="form.firstname" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
               </div>
               <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input v-model="form.lastname" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
               </div>
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
             </div>
             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                <input v-model="form.skills" type="text" placeholder="Road Repair, Drainage" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
             </div>
          </div>
          <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
             <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
             <button @click="createOfficer" :disabled="loading" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50">
                {{ loading ? 'Creating...' : 'Add Officer' }}
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
// const officers = ref([])
const showModal = ref(false)
const showEditModal = ref(false)
const selectedOfficer = ref<any>(null)
const editSkillsForm = ref('')
const loading = ref(false)
const form = reactive({
  firstname: '',
  lastname: '',
  email: '',
  skills: ''
})

const { data: officers, refresh } = await useAuthFetch('/officers')

const openAddModal = () => {
   showModal.value = true
}

const closeModal = () => {
   showModal.value = false
}

const authStore = useAuthStore()

const updateAvailability = async (officer: any, status: string) => {
   loading.value = true
   try {
      await $fetch(`${config.public.apiBase}/officers/${officer.id}/availability`, {
         method: 'PUT',
         headers: {
            Authorization: `Bearer ${authStore.token}`
         },
         params: { status }
      })
      await refresh()
   } catch (e) {
      alert('Failed to update availability')
   } finally {
      loading.value = false
   }
}

const createOfficer = async () => {
   loading.value = true
   try {
      await $fetch(`${config.public.apiBase}/officers`, {
         method: 'POST',
         headers: {
            Authorization: `Bearer ${authStore.token}`
         },
         body: {
            name: `${form.firstname} ${form.lastname}`,
            email: form.email,
            skills: form.skills.split(',').map(s => s.trim()),
            availabilityStatus: 'AVAILABLE',
            role: 'OFFICER'
         }
      })
      await refresh()
      closeModal()
   } catch (e) {
      alert('Failed to create officer')
   } finally {
      loading.value = false
   }
}

const openEditSkills = (officer: any) => {
   selectedOfficer.value = officer
   editSkillsForm.value = officer.skills.join(', ')
   showEditModal.value = true
}

const updateSkills = async () => {
   if (!selectedOfficer.value) return
   loading.value = true
   try {
      await $fetch(`${config.public.apiBase}/officers/${selectedOfficer.value.id}`, {
         method: 'PUT',
         headers: {
            Authorization: `Bearer ${authStore.token}`
         },
         body: {
            ...selectedOfficer.value,
            skills: editSkillsForm.value.split(',').map(s => s.trim())
         }
      })
      await refresh()
      showEditModal.value = false
   } catch (e) {
      alert('Failed to update skills')
   } finally {
      loading.value = false
   }
}
</script>
