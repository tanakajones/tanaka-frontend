<template>
  <div class="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
            <Icon name="heroicons:map" class="w-5 h-5" />
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            UrbanMap
          </span>
        </div>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-8">
          <!-- <NuxtLink to="/" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</NuxtLink> -->
          <NuxtLink v-if="authStore.isAuthenticated" to="/dashboard" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">Dashboard</NuxtLink>
          <NuxtLink v-if="authStore.isAdmin" to="/admin" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">Admin</NuxtLink>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center gap-4">
          <template v-if="!authStore.isAuthenticated">
            <NuxtLink to="/auth/login" class="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Login
            </NuxtLink>
            <NuxtLink to="/auth/register" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/30">
              Get Started
            </NuxtLink>
          </template>
          <template v-else>
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-gray-700">Hi, {{ authStore.user?.firstname || 'User' }}</span>
              <button @click="handleLogout" class="text-gray-500 hover:text-red-500 transition-colors">
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-6 h-6" />
              </button>
            </div>
          </template>
        </div>
      </nav>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
                <Icon name="heroicons:map" class="w-5 h-5" />
              </div>
              <span class="text-xl font-bold">UrbanMap</span>
            </div>
            <p class="text-gray-400 max-w-sm">
              Empowering citizens and municipalities to build better, safer, and more resilient urban environments together.
            </p>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4">Quick Links</h3>
            <ul class="space-y-2 text-gray-400">
              <li><NuxtLink to="/" class="hover:text-primary-400">Home</NuxtLink></li>
              <li><NuxtLink to="/dashboard" class="hover:text-primary-400">Report Issue</NuxtLink></li>
              <li><NuxtLink to="/admin" class="hover:text-primary-400">Admin Portal</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-lg mb-4">Contact</h3>
            <ul class="space-y-2 text-gray-400">
              <li>Emergency: 999</li>
              <li>Support: help@urbanmap.zim</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          &copy; {{ new Date().getFullYear() }} Urban Settlement Mapping System. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

<style scoped>
.router-link-active {
  @apply text-primary-600;
}
</style>
