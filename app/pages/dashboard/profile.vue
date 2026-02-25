<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Profile Header -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-10 text-white flex items-center gap-6">
        <div class="h-24 w-24 rounded-full bg-white/20 backdrop-blur border-4 border-white/30 flex items-center justify-center text-4xl font-bold shadow-xl">
          {{ authStore.user?.firstname?.charAt(0) || 'U' }}
        </div>
        <div>
          <h1 class="text-3xl font-bold">{{ authStore.user?.firstname }} {{ authStore.user?.lastname }}</h1>
          <p class="text-primary-100 text-lg">{{ authStore.user?.email }}</p>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mt-2 uppercase tracking-wide border border-white/10">
            {{ authStore.user?.role }} Account
          </span>
        </div>
      </div>

      <!-- Profile Details Form -->
      <div class="p-8">
        <h3 class="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Personal Information</h3>
        
        <form @submit.prevent="updateProfile" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input type="text" v-model="form.firstname" disabled
              class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input type="text" v-model="form.lastname" disabled
              class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input type="email" v-model="form.email" disabled
              class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed">
          </div>
        </form>

        <h3 class="text-xl font-bold text-gray-900 mt-10 mb-6 pb-2 border-b border-gray-100">Security</h3>
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
           <div>
             <h4 class="font-bold text-gray-800">Password</h4>
             <p class="text-sm text-gray-500">Last changed 3 months ago</p>
           </div>
           <button class="text-primary-600 hover:text-primary-700 font-medium">Change Password</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

const authStore = useAuthStore()

const form = reactive({
  firstname: authStore.user?.firstname || '',
  lastname: authStore.user?.lastname || '',
  email: authStore.user?.email || ''
})

const updateProfile = () => {
  // Implement update logic
  alert('Profile update disabled in demo.')
}
</script>
