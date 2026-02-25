<template>
  <div>
    <div class="flex justify-between items-center mb-6">
       <h2 class="text-2xl font-bold text-gray-800">User Management</h2>
       <button class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 flex items-center">
          <Icon name="heroicons:arrow-down-tray" class="w-5 h-5 mr-2" />
          Export CSV
       </button>
    </div>

    <!-- Users Table (Mock) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
       <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 text-gray-600 font-bold text-sm">
             <tr>
                <th class="p-4 border-b">User</th>
                <th class="p-4 border-b">Role</th>
                <th class="p-4 border-b">Status</th>
                <th class="p-4 border-b">Joined Date</th>
                <th class="p-4 border-b text-right">Actions</th>
             </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
             <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 group transition-colors">
                <td class="p-4 font-medium text-gray-900 flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                      {{ user.name.charAt(0) }}
                   </div>
                   <div>
                      <p>{{ user.name }}</p>
                      <p class="text-xs text-gray-400 font-normal">{{ user.email }}</p>
                   </div>
                </td>
                <td class="p-4">
                   <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">{{ user.role }}</span>
                </td>
                <td class="p-4">
                   <span :class="user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded-full text-xs font-bold">{{ user.status }}</span>
                </td>
                <td class="p-4 text-gray-500">{{ user.joinedDate }}</td>
                <td class="p-4 text-right">
                   <button class="text-gray-400 hover:text-red-600 transition-colors">
                      <Icon name="heroicons:trash" class="w-5 h-5" />
                   </button>
                </td>
             </tr>
          </tbody>
       </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Fetch Officers as "Users" for now (since we lack a full user list endpoint)
const config = useRuntimeConfig()
const { data: officersData } = await useAuthFetch('/officers')

const users = computed(() => {
  if (!officersData.value) return []
  const list = Array.isArray(officersData.value) ? officersData.value : []
  return list.map((o: any) => ({
      id: o.id,
      name: o.name,
      email: o.email,
      role: o.role || 'OFFICER',
      joinedDate: '2024-01-01', // Placeholder
      status: o.available ? 'Active' : 'Busy'
  }))
})
</script>
